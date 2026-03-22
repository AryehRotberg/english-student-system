import { PostgresService } from 'src/config/postgres.client';

export const getVocabularyTopicWordsByTopicIdQuery = PostgresService.readSql(
    __dirname,
    'get-vocabulary-topic-words-by-topic-id.sql',
);

export const getVocabularyTopicWordByIdQuery = PostgresService.readSql(
    __dirname,
    'get-vocabulary-topic-word-by-id.sql',
);

export const createVocabularyTopicWordQuery = PostgresService.readSql(
    __dirname,
    'create-vocabulary-topic-word.sql',
);
