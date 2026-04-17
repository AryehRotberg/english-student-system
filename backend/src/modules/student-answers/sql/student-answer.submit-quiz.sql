UPDATE
    QUIZ_ATTEMPTS
SET
    COMPLETED_AT = CURRENT_TIMESTAMP,
    POINTS = COALESCE((
        SELECT
            SUM(COALESCE(POINTS, 0))
        FROM
            student_answers
        WHERE
            ATTEMPT_ID = $1
    ), 0)
WHERE
    ID = $1
    AND COMPLETED_AT IS NULL
RETURNING
    ID,
    USER_ID AS "userId",
    QUIZ_ID AS "quizId",
    POINTS,
    STARTED_AT AS "startedAt",
    COMPLETED_AT AS "completedAt";