DELETE FROM ANSWERS
WHERE
    ID = $1 RETURNING ID,
    QUESTION_ID AS "questionId",
    ANSWER,
    BLANK_INDEX AS "blankIndex",
    CREATED_AT AS "createdAt";