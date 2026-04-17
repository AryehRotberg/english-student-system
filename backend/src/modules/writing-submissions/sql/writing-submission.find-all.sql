SELECT
    ID,
    TASK_ID AS "taskId",
    USER_ID AS "userId",
    CONTENT,
    FEEDBACK,
    SCORE,
    SUBMITTED_AT AS "submittedAt",
    REVIEWED_AT AS "reviewedAt"
FROM
    WRITING_SUBMISSIONS
WHERE
    ($1::uuid IS NULL OR USER_ID = $1::uuid)
    AND ($2::uuid IS NULL OR TASK_ID = $2::uuid)
ORDER BY
    SUBMITTED_AT DESC;