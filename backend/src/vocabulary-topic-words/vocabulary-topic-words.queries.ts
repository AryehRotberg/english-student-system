export const getVocabularyTopicWordsByTopicIdQuery = `
    SELECT
        VTW.ID,
        VTW.VOCABULARY_ID AS "vocabularyId",
        VTW.TOPIC_ID AS "topicId",
        V.WORD,
        V.MEANING,
        V.EXAMPLE,
        V.TRANSLATION,
        VT.TOPIC,
        VTW.CREATED_AT AS "createdAt"
    FROM
        VOCABULARY_TOPIC_WORDS VTW
        JOIN VOCABULARY V ON VTW.VOCABULARY_ID = V.ID
        JOIN VOCABULARY_TOPICS VT ON VTW.TOPIC_ID = VT.ID
    WHERE
        VTW.TOPIC_ID = $1
    ORDER BY
        VTW.CREATED_AT DESC
`;

export const getVocabularyTopicWordByIdQuery = `
    SELECT
        VTW.ID,
        VTW.VOCABULARY_ID AS "vocabularyId",
        VTW.TOPIC_ID AS "topicId",
        V.WORD,
        V.MEANING,
        V.EXAMPLE,
        V.TRANSLATION,
        VT.TOPIC,
        VTW.CREATED_AT AS "createdAt"
    FROM
        VOCABULARY_TOPIC_WORDS VTW
        JOIN VOCABULARY V ON VTW.VOCABULARY_ID = V.ID
        JOIN VOCABULARY_TOPICS VT ON VTW.TOPIC_ID = VT.ID
    WHERE
        VTW.ID = $1
`;

export const createVocabularyTopicWordQuery = `
    WITH inserted AS (
        INSERT INTO
            VOCABULARY_TOPIC_WORDS (VOCABULARY_ID, TOPIC_ID)
        VALUES
            ($1, $2)
        RETURNING
            ID,
            VOCABULARY_ID,
            TOPIC_ID,
            CREATED_AT
    )
    SELECT
        I.ID,
        I.VOCABULARY_ID AS "vocabularyId",
        I.TOPIC_ID AS "topicId",
        V.WORD,
        V.MEANING,
        V.EXAMPLE,
        V.TRANSLATION,
        VT.TOPIC,
        I.CREATED_AT AS "createdAt"
    FROM
        inserted I
        JOIN VOCABULARY V ON I.VOCABULARY_ID = V.ID
        JOIN VOCABULARY_TOPICS VT ON I.TOPIC_ID = VT.ID
`;
