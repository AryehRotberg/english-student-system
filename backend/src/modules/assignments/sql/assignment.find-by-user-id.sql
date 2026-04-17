SELECT
    ID,
    USER_ID AS "userId",
    TITLE,
    DESCRIPTION,
    DUE_DATE AS "dueDate",
    IS_COMPLETED AS "isCompleted",
    CREATED_AT AS "createdAt"
FROM
    ASSIGNMENTS
WHERE
    USER_ID = $1
ORDER BY
    CREATED_AT DESC;