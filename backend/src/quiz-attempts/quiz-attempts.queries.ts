export const getQuizAttemptsByUserIdAndQuizIdQuery = `
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
`;

export const getQuizAttemptByIdQuery = `
    SELECT
        ID,
        USER_ID AS "userId",
        QUIZ_ID AS "quizId",
        POINTS,
        STARTED_AT AS "startedAt",
        COMPLETED_AT AS "completedAt"
    FROM
        QUIZ_ATTEMPTS
    WHERE
        ID = $1
`;

export const createQuizAttemptQuery = `
    INSERT INTO
        QUIZ_ATTEMPTS (QUIZ_ID, USER_ID, POINTS, STARTED_AT, COMPLETED_AT)
    VALUES
        ($1, $2, $3, $4, $5)
    RETURNING
        ID,
        USER_ID AS "userId",
        QUIZ_ID AS "quizId",
        POINTS,
        STARTED_AT AS "startedAt",
        COMPLETED_AT AS "completedAt"
`;

export const updateQuizAttemptQuery = `
    UPDATE
        QUIZ_ATTEMPTS
    SET
        QUIZ_ID = $2,
        USER_ID = $3,
        POINTS = $4,
        STARTED_AT = $5,
        COMPLETED_AT = $6
    WHERE
        ID = $1
    RETURNING
        ID,
        USER_ID AS "userId",
        QUIZ_ID AS "quizId",
        POINTS,
        STARTED_AT AS "startedAt",
        COMPLETED_AT AS "completedAt"
`;

export const completeQuizAssignmentItemsForUserQuery = `
    UPDATE
        ASSIGNMENT_ITEMS AI
    SET
        STATUS = 'completed'
    FROM
        ASSIGNMENTS A
    WHERE
        AI.ASSIGNMENT_ID = A.ID
        AND A.USER_ID = $1
        AND AI.CONTENT_TYPE = 'quiz'
        AND AI.CONTENT_ID = $2
        AND AI.STATUS <> 'completed';
`;