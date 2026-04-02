SELECT
    ID,
    ATTEMPT_ID AS "attemptId",
    QUESTION_ID AS "questionId",
    SELECTED_OPTION_ID AS "selectedOptionId",
    TEXT_ANSWER AS "textAnswer",
    BLANK_INDEX AS "blankIndex",
    POINTS,
    CREATED_AT AS "createdAt"
FROM
    student_answers
ORDER BY
    CREATED_AT DESC;