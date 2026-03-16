export const getAllTextsQuery = `
    SELECT
        ID,
        TITLE,
        CONTENT,
        LEVEL,
        CREATED_AT AS "createdAt"
    FROM
        TEXTS
    ORDER BY
        CREATED_AT DESC
`;

export const createTextQuery = `
    INSERT INTO
        TEXTS (TITLE, CONTENT, LEVEL)
    VALUES
        ($1, $2, $3)
    RETURNING
        ID,
        TITLE,
        CONTENT,
        LEVEL,
        CREATED_AT AS "createdAt"
`;