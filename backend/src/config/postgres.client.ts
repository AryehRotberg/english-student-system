import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

const { Pool } = pg;

@Injectable()
export class PostgresService implements OnModuleInit {
    private pool: pg.Pool;
    private sqlCache = new Map<string, string>();

    constructor() {
        const requiredEnv = [
            'POSTGRES_USER',
            'POSTGRES_HOST',
            'POSTGRES_DATABASE',
            'POSTGRES_PASSWORD',
            'POSTGRES_PORT',
        ];

        for (const key of requiredEnv) {
            if (!process.env[key]) throw new Error(`${key} is required`);
        }

        const certPaths = [
            path.join(process.cwd(), 'certs', 'prod-ca-2021.crt'),
            path.join(process.cwd(), 'dist', 'certs', 'prod-ca-2021.crt'),
            path.join(__dirname, '..', '..', 'certs', 'prod-ca-2021.crt'),
        ];

        const validPath = certPaths.find((p) => fs.existsSync(p));
        let caCert: string | undefined = undefined;

        if (validPath) {
            Logger.log(`Loaded SSL certificate from: ${validPath}`);
            caCert = fs.readFileSync(validPath, 'utf8');
        }

        if (!caCert) {
            Logger.warn(
                'SSL Certificate (prod-ca-2021.crt) NOT FOUND. Falling back to insecure connection (rejectUnauthorized: false).',
            );
        }

        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DATABASE,
            password: process.env.POSTGRES_PASSWORD,
            port: Number(process.env.POSTGRES_PORT),
            min: 1,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            keepAlive: true,
            ssl: {
                rejectUnauthorized: !!caCert,
                ...(caCert ? { ca: caCert } : {}),
            },
        });

        this.pool.on('error', (err) => {
            Sentry.captureException(err);
            Logger.error('Unexpected error on idle client', err);
        });
    }

    async onModuleInit() {
        const baseDir = path.join(process.cwd(), 'dist');
        this.loadAllSqlFiles(baseDir);
        Logger.log(
            `[PostgresService] Pre-warmed cache with ${this.sqlCache.size} SQL queries.`,
        );

        try {
            const client = await this.pool.connect();
            client.release();
            Logger.log('Database connected successfully');
        } catch (err) {
            Logger.error('Failed to connect to database on startup', err);
            throw err;
        }
    }

    private loadAllSqlFiles(dir: string) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);

            if (fs.statSync(fullPath).isDirectory()) {
                this.loadAllSqlFiles(fullPath);
            } else if (fullPath.endsWith('.sql')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                this.sqlCache.set(fullPath, content);
            }
        }
    }

    async query<T = any>(query: string, parameters?: any[]): Promise<T[]> {
        try {
            const result = await this.pool.query(query, parameters ?? []);
            return result.rows as T[];
        } catch (error) {
            Logger.error(
                `Database query error: ${error}`,
                error instanceof Error ? error.stack : '',
            );
            Sentry.captureException(error);
            return Promise.reject(error);
        }
    }

    getSql(moduleName: string, fileName: string): string {
        const key = path.join(moduleName, 'sql', fileName);
        const query = this.sqlCache.get(key);
        if (!query) {
            throw new Error(`SQL file missing from cache: ${key}`);
        }
        return query;
    }
}
