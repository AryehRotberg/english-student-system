INSERT INTO
    QUIZ_ATTEMPTS (
        QUIZ_ID,
        USER_ID,
        POINTS,
        STARTED_AT,
        COMPLETED_AT
    )
VALUES
    ($1, $2, $3, $4, $5) RETURNING ID,
    USER_ID AS "userId",
    QUIZ_ID AS "quizId",
    POINTS,
    STARTED_AT AS "startedAt",
    COMPLETED_AT AS "completedAt";