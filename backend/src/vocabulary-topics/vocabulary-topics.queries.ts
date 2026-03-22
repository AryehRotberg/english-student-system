import { PostgresService } from 'src/config/postgres.client';

export const getAllVocabularyTopicsQuery = PostgresService.readSql(
    __dirname,
    'get-all-vocabulary-topics.sql',
);

export const createVocabularyTopicQuery = PostgresService.readSql(
    __dirname,
    'create-vocabulary-topic.sql',
);
