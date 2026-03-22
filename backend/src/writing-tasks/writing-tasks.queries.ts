import { PostgresService } from 'src/config/postgres.client';

export const getAllWritingTasksQuery = PostgresService.readSql(
    __dirname,
    'get-all-writing-tasks.sql',
);

export const createWritingTaskQuery = PostgresService.readSql(
    __dirname,
    'create-writing-task.sql',
);
