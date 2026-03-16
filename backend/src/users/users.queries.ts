export const insertUserQuery = `
    INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE)
    VALUES ($1, $2, $3, $4)
    RETURNING
        ID,
        NAME,
        EMAIL,
        PASSWORD,
        ROLE,
        CREATED_AT AS "createdAt"
`;

export const getUserByEmailQuery = `
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
        EMAIL = $1
`;

export const getAllUsersQuery = `
    SELECT
        ID,
        NAME,
        EMAIL,
        PASSWORD,
        ROLE,
        CREATED_AT AS "createdAt"
    FROM
        USERS
`;

export const deleteUserQuery = `
    DELETE FROM USERS
    WHERE ID = $1
    RETURNING
        ID,
        NAME,
        EMAIL,
        PASSWORD,
        ROLE,
        CREATED_AT AS "createdAt"
`;
