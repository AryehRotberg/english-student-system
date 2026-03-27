SELECT
    ID,
    NAME,
    EMAIL,
    PASSWORD,
    ROLE,
    CREATED_AT AS "createdAt"
FROM
    USERS
WHERE
    ROLE = 'student'
ORDER BY
    NAME ASC;