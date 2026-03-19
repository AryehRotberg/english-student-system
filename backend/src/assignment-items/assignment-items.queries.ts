export const getAssignmentItemsByUserIdQuery = `
    SELECT
        AI.ID,
        A.ID AS "assignmentId",
        A.TITLE AS "assignmentTitle",
        A.DESCRIPTION AS "assignmentDescription",
        AI.STATUS AS "status",
        AI.CONTENT_TYPE AS "contentType",
        AI.CONTENT_ID AS "contentId",
        COALESCE(Q.TITLE, T.TITLE, W.TITLE, VT.TOPIC) AS "title"
    FROM
        ASSIGNMENTS A
        JOIN ASSIGNMENT_ITEMS AI ON AI.ASSIGNMENT_ID = A.ID
        LEFT JOIN QUIZZES Q ON AI.CONTENT_TYPE = 'quiz'
        AND AI.CONTENT_ID = Q.ID
        LEFT JOIN TEXTS T ON AI.CONTENT_TYPE = 'text'
        AND AI.CONTENT_ID = T.ID
        LEFT JOIN WRITING_TASKS W ON AI.CONTENT_TYPE = 'writing'
        AND AI.CONTENT_ID = W.ID
        LEFT JOIN VOCABULARY_TOPICS VT ON AI.CONTENT_TYPE = 'vocabulary'
        AND AI.CONTENT_ID = VT.ID
    WHERE
        A.USER_ID = $1;
`;

export const createAssignmentItemQuery = `
    INSERT INTO
        ASSIGNMENT_ITEMS (ASSIGNMENT_ID, CONTENT_TYPE, CONTENT_ID, STATUS)
    VALUES
        ($1, $2, $3, $4)
    RETURNING
        *;
`;
