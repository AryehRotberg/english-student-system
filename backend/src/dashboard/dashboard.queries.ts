import { PostgresService } from 'src/config/postgres.client';

export const getRecentActivitiesQuery = PostgresService.readSql(
    __dirname,
    'get-recent-activities.sql',
);

export const getActiveTasksQuery = PostgresService.readSql(
    __dirname,
    'get-active-tasks.sql',
);

export const getQuizProgressQuery = PostgresService.readSql(
    __dirname,
    'get-quiz-progress.sql',
);

export const getContentProgressQuery = PostgresService.readSql(
    __dirname,
    'get-content-progress.sql',
);
