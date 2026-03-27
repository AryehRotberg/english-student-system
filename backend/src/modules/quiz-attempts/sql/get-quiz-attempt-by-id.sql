SELECT
    ID,
    USER_ID AS "userId",
    QUIZ_ID AS "quizId",
    POINTS,
    STARTED_AT AS "startedAt",
    COMPLETED_AT AS "completedAt"
FROM
    QUIZ_ATTEMPTS
WHERE
    ID = $1;