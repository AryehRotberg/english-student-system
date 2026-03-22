import { PostgresService } from '../config/postgres.client';

export const getAssignmentsByUserIdQuery = PostgresService.readSql(
    __dirname,
    'get-assignments-by-user-id.sql',
);

export const createAssignmentQuery = PostgresService.readSql(
    __dirname,
    'create-assignment.sql',
);
