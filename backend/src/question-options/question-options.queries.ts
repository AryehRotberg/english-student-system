import { PostgresService } from 'src/config/postgres.client';

export const getQuestionOptionsByQuestionIdQuery = PostgresService.readSql(
    __dirname,
    'get-question-options-by-question-id.sql',
);

export const getQuestionOptionByIdQuery = PostgresService.readSql(
    __dirname,
    'get-question-option-by-id.sql',
);

export const createQuestionOptionQuery = PostgresService.readSql(
    __dirname,
    'create-question-option.sql',
);

export const updateQuestionOptionQuery = PostgresService.readSql(
    __dirname,
    'update-question-option.sql',
);
