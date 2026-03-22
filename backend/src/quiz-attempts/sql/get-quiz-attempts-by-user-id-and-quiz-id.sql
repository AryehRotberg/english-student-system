SELECT
    id,
    user_id AS "userId",
    quiz_id AS "quizId",
    points,
    started_at AS "startedAt",
    completed_at AS "completedAt"
FROM
    QUIZ_ATTEMPTS
WHERE
    USER_ID = $1
    AND QUIZ_ID = $2;