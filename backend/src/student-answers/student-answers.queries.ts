import { PostgresService } from '../config/postgres.client';

export const getAllStudentAnswersQuery = PostgresService.readSql(
    __dirname,
    'get-all-student-answers.sql',
);

export const getStudentAnswerByIdQuery = PostgresService.readSql(
    __dirname,
    'get-student-answer-by-id.sql',
);

export const upsertStudentAnswerQuery = PostgresService.readSql(
    __dirname,
    'upsert-student-answer.sql',
);

export const deleteStudentAnswerQuery = PostgresService.readSql(
    __dirname,
    'delete-student-answer.sql',
);

export const getUnifiedGradingDataQuery = PostgresService.readSql(
    __dirname,
    'get-unified-grading-data.sql',
);

export const submitQuizAttemptQuery = PostgresService.readSql(
    __dirname,
    'submit-quiz-attempt.sql',
);

export const markQuizAssignmentCompletedQuery = PostgresService.readSql(
    __dirname,
    'mark-quiz-assignment-completed.sql',
);
