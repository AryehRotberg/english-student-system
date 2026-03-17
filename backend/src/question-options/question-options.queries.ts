export const getQuestionOptionsByQuestionIdQuery = `
    SELECT
        ID,
        QUESTION_ID AS "questionId",
        OPTION_TEXT AS "optionText",
        IS_CORRECT AS "isCorrect",
        CREATED_AT AS "createdAt"
    FROM
        QUESTION_OPTIONS
    WHERE
        QUESTION_ID = $1
`;

export const getQuestionOptionByIdQuery = `
    SELECT
        ID,
        QUESTION_ID AS "questionId",
        OPTION_TEXT AS "optionText",
        IS_CORRECT AS "isCorrect",
        CREATED_AT AS "createdAt"
    FROM
        QUESTION_OPTIONS
    WHERE
        ID = $1
`;

export const createQuestionOptionQuery = `
    INSERT INTO
        QUESTION_OPTIONS (QUESTION_ID, OPTION_TEXT, IS_CORRECT)
    VALUES
        ($1, $2, $3)
    RETURNING
        ID,
        QUESTION_ID AS "questionId",
        OPTION_TEXT AS "optionText",
        IS_CORRECT AS "isCorrect",
        CREATED_AT AS "createdAt"
`;

export const updateQuestionOptionQuery = `
    UPDATE
        QUESTION_OPTIONS
    SET
        QUESTION_ID = COALESCE($2, QUESTION_ID),
        OPTION_TEXT = COALESCE($3, OPTION_TEXT),
        IS_CORRECT = COALESCE($4, IS_CORRECT)
    WHERE
        ID = $1
    RETURNING
        ID,
        QUESTION_ID AS "questionId",
        OPTION_TEXT AS "optionText",
        IS_CORRECT AS "isCorrect",
        CREATED_AT AS "createdAt"
`;