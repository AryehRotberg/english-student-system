import { PostgresService } from '../../config/postgres.client';

export const getAllTextsQuery = PostgresService.readSql(
    __dirname,
    'get-all-texts.sql',
);

export const createTextQuery = PostgresService.readSql(
    __dirname,
    'create-text.sql',
);
