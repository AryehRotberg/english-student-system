import { PostgresService } from '../config/postgres.client';

export const createWritingSubmissionQuery = PostgresService.readSql(
    __dirname,
    'create-writing-submission.sql',
);

export const updateWritingSubmissionQuery = PostgresService.readSql(
    __dirname,
    'update-writing-submission.sql',
);

export const getWritingSubmissionsQuery = PostgresService.readSql(
    __dirname,
    'get-writing-submissions.sql',
);
