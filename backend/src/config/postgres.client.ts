import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

const { Pool } = pg;

@Injectable()
export class PostgresService {
    private pool: pg.Pool;
    private static sqlCache = new Map<string, string>();

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

        const caCert = certPaths.find(
            (p) =>
                fs.existsSync(p) &&
                Logger.log(`Loaded SSL certificate from: ${p}`),
        )
            ? fs.readFileSync(certPaths.find(fs.existsSync)!, 'utf8')
            : undefined;

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

    static readSql(callerDir: string, fileName: string): string {
        const fullPath = path.join(callerDir, 'sql', fileName);

        if (!this.sqlCache.has(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            this.sqlCache.set(fullPath, content);
        }

        return this.sqlCache.get(fullPath)!;
    }
}
