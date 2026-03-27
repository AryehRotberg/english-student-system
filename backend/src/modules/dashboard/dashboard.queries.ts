import { PostgresService } from '../../config/postgres.client';

export const getQuizProgressQuery = PostgresService.readSql(
    __dirname,
    'get-quiz-progress.sql',
);

export const getContentProgressQuery = PostgresService.readSql(
    __dirname,
    'get-content-progress.sql',
);
