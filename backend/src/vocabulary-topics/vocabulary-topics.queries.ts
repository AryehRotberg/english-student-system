export const getAllVocabularyTopicsQuery = `
    SELECT
        ID,
        TOPIC,
        DESCRIPTION,
        CREATED_AT AS "createdAt"
    FROM
        VOCABULARY_TOPICS
    ORDER BY
        CREATED_AT DESC
`;

export const createVocabularyTopicQuery = `
    INSERT INTO
        VOCABULARY_TOPICS (TOPIC, DESCRIPTION)
    VALUES
        ($1, $2)
    RETURNING
        ID,
        TOPIC,
        DESCRIPTION,
        CREATED_AT AS "createdAt"
`;
