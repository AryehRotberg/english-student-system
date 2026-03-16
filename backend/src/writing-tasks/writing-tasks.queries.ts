export const getAllWritingTasksQuery = `
    SELECT
        ID,
        TITLE,
        INSTRUCTIONS,
        MIN_WORDS AS "minWords",
        CREATED_AT AS "createdAt"
    FROM
        WRITING_TASKS
    ORDER BY
        CREATED_AT DESC
`;

export const createWritingTaskQuery = `
    INSERT INTO
        WRITING_TASKS (TITLE, INSTRUCTIONS, MIN_WORDS)
    VALUES
        ($1, $2, $3)
    RETURNING
        ID,
        TITLE,
        INSTRUCTIONS,
        MIN_WORDS AS "minWords",
        CREATED_AT AS "createdAt"
`;