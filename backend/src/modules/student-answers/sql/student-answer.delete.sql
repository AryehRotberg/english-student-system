DELETE FROM
    student_answers
WHERE
    ID = $1
RETURNING
    ID,
    ATTEMPT_ID AS "attemptId",
    QUESTION_ID AS "questionId",
    SELECTED_OPTION_ID AS "selectedOptionId",
    TEXT_ANSWER AS "textAnswer",
    BLANK_INDEX AS "blankIndex",
    POINTS,
    CREATED_AT AS "createdAt";
