SELECT
    AI.CONTENT_TYPE AS "contentType",
    COUNT(*)::int AS "totalItems",
    SUM(
        CASE
            WHEN AI.STATUS = 'completed' THEN 1
            ELSE 0
        END
    )::int AS "completedItems"
FROM
    ASSIGNMENT_ITEMS AI
    JOIN ASSIGNMENTS A ON AI.ASSIGNMENT_ID = A.ID
WHERE
    A.USER_ID = $1
    AND A.STATUS = 'assigned'
GROUP BY
    AI.CONTENT_TYPE;