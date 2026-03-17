export const getAllAnswersQuery = `
    SELECT
        ID,
        QUESTION_ID AS "questionId",
        ANSWER,
        BLANK_INDEX AS "blankIndex",
        CREATED_AT AS "createdAt"
    FROM
        ANSWERS
    ORDER BY
        CREATED_AT DESC
`;

export const getAnswerByIdQuery = `
    SELECT
        ID,
        QUESTION_ID AS "questionId",
        ANSWER,
        BLANK_INDEX AS "blankIndex",
        CREATED_AT AS "createdAt"
    FROM
        ANSWERS
    WHERE
        ID = $1
`;

export const createAnswerQuery = `
    INSERT INTO
        ANSWERS (QUESTION_ID, ANSWER, BLANK_INDEX)
    VALUES
        ($1, $2, $3)
    RETURNING
        ID,
        QUESTION_ID AS "questionId",
        ANSWER,
        BLANK_INDEX AS "blankIndex",
        CREATED_AT AS "createdAt"
`;

export const updateAnswerQuery = `
    UPDATE
        ANSWERS
    SET
        QUESTION_ID = COALESCE($2, QUESTION_ID),
        ANSWER = COALESCE($3, ANSWER),
        BLANK_INDEX = COALESCE($4, BLANK_INDEX)
    WHERE
        ID = $1
    RETURNING
        ID,
        QUESTION_ID AS "questionId",
        ANSWER,
        BLANK_INDEX AS "blankIndex",
        CREATED_AT AS "createdAt"
`;

export const deleteAnswerQuery = `
    DELETE FROM
        ANSWERS
    WHERE
        ID = $1
    RETURNING
        ID,
        QUESTION_ID AS "questionId",
        ANSWER,
        BLANK_INDEX AS "blankIndex",
        CREATED_AT AS "createdAt"
`;
