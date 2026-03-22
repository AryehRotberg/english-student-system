import { PostgresService } from 'src/config/postgres.client';

export const getAssignmentItemsByUserIdQuery = PostgresService.readSql(
    __dirname,
    'get-assignment-items-by-user-id.sql',
);

export const createAssignmentItemQuery = PostgresService.readSql(
    __dirname,
    'create-assignment-item.sql',
);
