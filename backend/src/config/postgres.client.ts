import { Injectable, Logger } from '@nestjs/common';
// import * as Sentry from '@sentry/node';
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

const { Pool } = pg;

@Injectable()
export class PostgresService {
    private pool: pg.Pool;

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

        const possiblePaths = [
            path.join(process.cwd(), 'certs', 'prod-ca-2021.crt'),
            path.join(process.cwd(), 'dist', 'certs', 'prod-ca-2021.crt'),
            path.join(__dirname, '..', '..', 'certs', 'prod-ca-2021.crt'),
        ];

        let caCert: string | undefined;

        for (const certPath of possiblePaths) {
            if (fs.existsSync(certPath)) {
                try {
                    caCert = fs.readFileSync(certPath).toString();
                    Logger.log(`Loaded SSL certificate from: ${certPath}`);
                    break;
                } catch (e) {
                    Logger.error(`Failed to read cert at ${certPath}`, e);
                }
            }
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
            // Sentry.captureException(err);
            Logger.error('Unexpected error on idle client', err);
        });
    }

    async query<T = any>(query: string, parameters?: any[]): Promise<T[]> {
        try {
            const result = await this.pool.query(query, parameters ?? []);
            return result.rows as T[];
        } catch (error) {
            Logger.error(`Database query error: ${error.message}`, error.stack);
            // Sentry.captureException(error);
            return Promise.reject(error);
        }
    }
}
