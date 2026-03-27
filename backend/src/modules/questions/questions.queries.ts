import { PostgresService } from '../../config/postgres.client';

export const getAllQuestionsQuery = PostgresService.readSql(
    __dirname,
    'get-all-questions.sql',
);
export const createQuestionQuery = PostgresService.readSql(
    __dirname,
    'create-question.sql',
);
