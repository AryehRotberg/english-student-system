DELETE FROM
    STUDENT_ANSWERS
WHERE
    ID = $1
RETURNING
    ID,
    ATTEMPT_ID AS "attemptId",
    QUESTION_ID AS "questionId",
    ANSWER_DATA AS "answerData",
    CREATED_AT AS "createdAt",
    POINTS,
    FEEDBACK;