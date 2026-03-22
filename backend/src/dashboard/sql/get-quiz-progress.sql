WITH
    user_quizzes AS (
        SELECT
            AI.CONTENT_ID AS quiz_id,
            AI.STATUS
        FROM
            ASSIGNMENT_ITEMS AI
            JOIN ASSIGNMENTS A ON AI.ASSIGNMENT_ID = A.ID
        WHERE
            A.USER_ID = $1
            AND AI.CONTENT_TYPE = 'quiz'
    ),
    latest_attempts AS (
        SELECT
            ID AS attempt_id,
            QUIZ_ID,
            COMPLETED_AT
        FROM
            (
                SELECT
                    ID,
                    QUIZ_ID,
                    COMPLETED_AT,
                    ROW_NUMBER() OVER (
                        PARTITION BY
                            QUIZ_ID
                        ORDER BY
                            STARTED_AT DESC
                    ) as rn
                FROM
                    QUIZ_ATTEMPTS
                WHERE
                    USER_ID = $1
            ) ranked
        WHERE
            rn = 1
    ),
    quiz_totals AS (
        SELECT
            QUIZ_ID,
            COUNT(ID) AS total_questions
        FROM
            QUIZ_QUESTIONS
        GROUP BY
            QUIZ_ID
    ),
    attempt_answers AS (
        SELECT
            ATTEMPT_ID,
            COUNT(DISTINCT QUESTION_ID) AS answered_questions
        FROM
            STUDENT_ANSWERS
        GROUP BY
            ATTEMPT_ID
    )
SELECT
    UQ.QUIZ_ID AS "quizId",
    UQ.STATUS AS "assignmentStatus",
    LA.COMPLETED_AT AS "completedAt",
    COALESCE(QT.TOTAL_QUESTIONS, 0)::int AS "totalQuestions",
    COALESCE(AA.ANSWERED_QUESTIONS, 0)::int AS "answeredQuestions"
FROM
    user_quizzes UQ
    LEFT JOIN latest_attempts LA ON UQ.QUIZ_ID = LA.QUIZ_ID
    LEFT JOIN quiz_totals QT ON UQ.QUIZ_ID = QT.QUIZ_ID
    LEFT JOIN attempt_answers AA ON LA.ATTEMPT_ID = AA.ATTEMPT_ID;