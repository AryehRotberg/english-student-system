SELECT
    ID,
    QUESTION_ID AS "questionId",
    OPTION_TEXT AS "optionText",
    IS_CORRECT AS "isCorrect",
    CREATED_AT AS "createdAt"
FROM
    QUESTION_OPTIONS
WHERE
    ID = $1;