export const getAllVocabularyQuery = `
    SELECT
        ID,
        WORD,
        MEANING,
        EXAMPLE,
        TRANSLATION,
        CREATED_AT AS "createdAt"
    FROM
        VOCABULARY
    ORDER BY
        CREATED_AT DESC
`;

export const createVocabularyQuery = `
    INSERT INTO
        VOCABULARY (WORD, MEANING, EXAMPLE, TRANSLATION)
    VALUES
        ($1, $2, $3, $4)
    RETURNING
        ID,
        WORD,
        MEANING,
        EXAMPLE,
        TRANSLATION,
        CREATED_AT AS "createdAt"
`;
