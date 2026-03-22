import { PostgresService } from 'src/config/postgres.client';

export const getAllVocabularyQuery = PostgresService.readSql(
    __dirname,
    'get-all-vocabulary.sql',
);

export const createVocabularyQuery = PostgresService.readSql(
    __dirname,
    'create-vocabulary.sql',
);
