import { PostgresService } from 'src/config/postgres.client';

export const insertUserQuery = PostgresService.readSql(
    __dirname,
    'insert-user.sql',
);

export const getUserByEmailQuery = PostgresService.readSql(
    __dirname,
    'get-user-by-email.sql',
);

export const getAllUsersQuery = PostgresService.readSql(
    __dirname,
    'get-all-users.sql',
);

export const deleteUserQuery = PostgresService.readSql(
    __dirname,
    'delete-user.sql',
);
