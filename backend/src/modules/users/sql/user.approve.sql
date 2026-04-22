UPDATE USERS
SET
    IS_APPROVED = TRUE
WHERE
    ID = $1
RETURNING
    ID,
    NAME,
    EMAIL,
    PASSWORD,
    ROLE,
    TEACHER_ID AS "teacherId",
    IS_APPROVED AS "isApproved",
    CREATED_AT AS "createdAt";