import { PostgresService } from '../../config/postgres.client';

export const getAllQuizzesQuery = PostgresService.readSql(
    __dirname,
    'get-all-quizzes.sql',
);

export const createQuizQuery = PostgresService.readSql(
    __dirname,
    'create-quiz.sql',
);

export const getQuizTopicsByQuizIdQuery = PostgresService.readSql(
    __dirname,
    'get-quiz-topics-by-quiz-id.sql',
);
