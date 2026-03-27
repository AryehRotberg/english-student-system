import { PostgresService } from '../../config/postgres.client';

export const getAllAnswersQuery = PostgresService.readSql(
    __dirname,
    'get-all-answers.sql',
);
export const getAnswerByIdQuery = PostgresService.readSql(
    __dirname,
    'get-answer-by-id.sql',
);
export const createAnswerQuery = PostgresService.readSql(
    __dirname,
    'create-answer.sql',
);
export const updateAnswerQuery = PostgresService.readSql(
    __dirname,
    'update-answer.sql',
);
export const deleteAnswerQuery = PostgresService.readSql(
    __dirname,
    'delete-answer.sql',
);
