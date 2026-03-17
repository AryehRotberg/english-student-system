export const getAssignmentsByUserIdQuery = `
    SELECT
        ID,
        USER_ID AS "userId",
        TITLE,
        DESCRIPTION,
        DUE_DATE AS "dueDate",
        STATUS,
        CREATED_AT AS "createdAt"
    FROM
        ASSIGNMENTS
    WHERE
        USER_ID = $1
    ORDER BY
        CREATED_AT DESC
`;

export const createAssignmentQuery = `
    INSERT INTO
        ASSIGNMENTS (USER_ID, TITLE, DESCRIPTION, DUE_DATE)
    VALUES
        ($1, $2, $3, $4)
    RETURNING
        ID,
        USER_ID AS "userId",
        TITLE,
        DESCRIPTION,
        DUE_DATE AS "dueDate",
        CREATED_AT AS "createdAt"
`;
