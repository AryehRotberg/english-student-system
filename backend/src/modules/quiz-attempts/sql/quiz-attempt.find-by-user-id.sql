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
AND completed_at IS NOT NULL
ORDER BY
    STARTED_AT DESC;