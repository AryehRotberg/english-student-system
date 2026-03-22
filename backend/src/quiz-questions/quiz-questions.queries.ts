import { PostgresService } from 'src/config/postgres.client';

export const getQuizQuestionsByQuizIdQuery = PostgresService.readSql(
    __dirname,
    'get-quiz-questions-by-quiz-id.sql',
);

export const getQuizQuestionByIdQuery = PostgresService.readSql(
    __dirname,
    'get-quiz-question-by-id.sql',
);

export const createQuizQuestionQuery = PostgresService.readSql(
    __dirname,
    'create-quiz-question.sql',
);

export const updateQuizQuestionQuery = PostgresService.readSql(
    __dirname,
    'update-quiz-question.sql',
);

export const getFullQuizQuestionsQuery = PostgresService.readSql(
    __dirname,
    'get-full-quiz-questions.sql',
);
