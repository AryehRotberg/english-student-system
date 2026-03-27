import { PostgresService } from '../../config/postgres.client';

export const getQuizAttemptsByUserIdAndQuizIdQuery = PostgresService.readSql(
    __dirname,
    'get-quiz-attempts-by-user-id-and-quiz-id.sql',
);

export const getQuizAttemptByIdQuery = PostgresService.readSql(
    __dirname,
    'get-quiz-attempt-by-id.sql',
);

export const createQuizAttemptQuery = PostgresService.readSql(
    __dirname,
    'create-quiz-attempt.sql',
);

export const updateQuizAttemptQuery = PostgresService.readSql(
    __dirname,
    'update-quiz-attempt.sql',
);

export const completeQuizAssignmentItemsForUserQuery = PostgresService.readSql(
    __dirname,
    'complete-quiz-assignment-items-for-user.sql',
);

export const getQuizAttemptsByUserIdQuery = PostgresService.readSql(
    __dirname,
    'get-quiz-attempts-by-user-id.sql',
);
