export const getAssignmentCompletionSummaryQuery = `
    WITH attempt_data AS (
        SELECT
            QA.ID AS "attemptId",
            QA.USER_ID AS "userId",
            QA.QUIZ_ID AS "quizId",
            QA.POINTS,
            QA.COMPLETED_AT AS "completedAt",
            U.NAME AS "studentName",
            U.EMAIL AS "studentEmail",
            COALESCE(Q.TITLE, 'Quiz') AS "quizTitle"
        FROM
            QUIZ_ATTEMPTS QA
            JOIN USERS U ON U.ID = QA.USER_ID
            LEFT JOIN QUIZZES Q ON Q.ID = QA.QUIZ_ID
        WHERE
            QA.ID = $1
    ),
    quiz_totals AS (
        SELECT
            AD."quizId",
            COALESCE(SUM(QQ.MAX_POINTS), 0) AS "totalPoints"
        FROM
            attempt_data AD
            LEFT JOIN QUIZ_QUESTIONS QQ ON QQ.QUIZ_ID = AD."quizId"
        GROUP BY
            AD."quizId"
    ),
    assignment_data AS (
        SELECT
            A.ID AS "assignmentId",
            COALESCE(A.TITLE, 'Assignment') AS "assignmentTitle"
        FROM
            attempt_data AD
            JOIN ASSIGNMENT_ITEMS AI ON AI.CONTENT_TYPE = 'quiz'
            AND AI.CONTENT_ID = AD."quizId"
            JOIN ASSIGNMENTS A ON A.ID = AI.ASSIGNMENT_ID
            AND A.USER_ID = AD."userId"
        ORDER BY
            A.CREATED_AT DESC
        LIMIT 1
    ),
    assignment_progress AS (
        SELECT
            AD."assignmentId",
            COUNT(AI.ID) AS "totalItems",
            COUNT(*) FILTER (
                WHERE
                    AI.STATUS = 'completed'
            ) AS "completedItems"
        FROM
            assignment_data AD
            LEFT JOIN ASSIGNMENT_ITEMS AI ON AI.ASSIGNMENT_ID = AD."assignmentId"
        GROUP BY
            AD."assignmentId"
    )
    SELECT
        AD."attemptId",
        AD."studentName",
        AD."studentEmail",
        AD."quizTitle",
        AD.POINTS,
        AD."completedAt",
        QT."totalPoints",
        AD2."assignmentTitle",
        AP."completedItems",
        AP."totalItems"
    FROM
        attempt_data AD
        LEFT JOIN quiz_totals QT ON QT."quizId" = AD."quizId"
        LEFT JOIN assignment_data AD2 ON TRUE
        LEFT JOIN assignment_progress AP ON AP."assignmentId" = AD2."assignmentId";
`;

export const getTeacherEmailsQuery = `
    SELECT
        NAME AS "name",
        EMAIL AS "email"
    FROM
        USERS
    WHERE
        ROLE = 'teacher';
`;
