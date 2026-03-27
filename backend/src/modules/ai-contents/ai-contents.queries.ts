import { PostgresService } from '../../config/postgres.client';

export const getAllAiContentsQuery = PostgresService.readSql(
    __dirname,
    'get-all-ai-contents.sql',
);

export const createAiContentQuery = PostgresService.readSql(
    __dirname,
    'create-ai-content.sql',
);
