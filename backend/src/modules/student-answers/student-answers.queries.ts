import { PostgresService } from '../../config/postgres.client';

export const getAllStudentAnswersQuery = PostgresService.readSql(
    __dirname,
    'get-all-student-answers.sql',
);

export const getStudentAnswerByIdQuery = PostgresService.readSql(
    __dirname,
    'get-student-answer-by-id.sql',
);

export const getStudentAnswersByAttemptQuery = PostgresService.readSql(
    __dirname,
    'get-student-answers-by-attempt.sql',
);

export const upsertStudentAnswerQuery = PostgresService.readSql(
    __dirname,
    'upsert-student-answer.sql',
);

export const deleteStudentAnswerQuery = PostgresService.readSql(
    __dirname,
    'delete-student-answer.sql',
);

export const getCorrectOptionsQuery = PostgresService.readSql(
    __dirname,
    'get-correct-options.sql',
);

export const getValidAnswersQuery = PostgresService.readSql(
    __dirname,
    'get-valid-answers.sql',
);
