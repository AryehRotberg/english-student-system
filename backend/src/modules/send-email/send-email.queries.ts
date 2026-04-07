import { PostgresService } from '../../config/postgres.client';

export const getAssignmentCompletionSummaryQuery = PostgresService.readSql(
    __dirname,
    'get-assignment-completion-summary.sql',
);
