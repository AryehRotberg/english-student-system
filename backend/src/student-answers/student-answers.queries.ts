export const getAllStudentAnswersQuery = `
    SELECT
        ID,
        ATTEMPT_ID AS "attemptId",
        QUESTION_ID AS "questionId",
        ANSWER_DATA AS "answerData",
        CREATED_AT AS "createdAt",
        POINTS,
        FEEDBACK
    FROM
        STUDENT_ANSWERS
    ORDER BY
        CREATED_AT DESC
`;

export const getStudentAnswerByIdQuery = `
    SELECT
        ID,
        ATTEMPT_ID AS "attemptId",
        QUESTION_ID AS "questionId",
        ANSWER_DATA AS "answerData",
        CREATED_AT AS "createdAt",
        POINTS,
        FEEDBACK
    FROM
        STUDENT_ANSWERS
    WHERE
        ID = $1
`;

export const upsertStudentAnswerQuery = `
    INSERT INTO
        STUDENT_ANSWERS (ATTEMPT_ID, QUESTION_ID, ANSWER_DATA, POINTS, FEEDBACK)
    VALUES
        ($1, $2, $3, $4, $5)
    ON CONFLICT (ATTEMPT_ID, QUESTION_ID)
    DO UPDATE SET
        ANSWER_DATA = EXCLUDED.ANSWER_DATA,
        POINTS = EXCLUDED.POINTS,
        FEEDBACK = COALESCE(EXCLUDED.FEEDBACK, STUDENT_ANSWERS.FEEDBACK)
    RETURNING
        ID,
        ATTEMPT_ID AS "attemptId",
        QUESTION_ID AS "questionId",
        ANSWER_DATA AS "answerData",
        CREATED_AT AS "createdAt",
        POINTS,
        FEEDBACK
`;

export const deleteStudentAnswerQuery = `
    DELETE FROM
        STUDENT_ANSWERS
    WHERE
        ID = $1
    RETURNING
        ID,
        ATTEMPT_ID AS "attemptId",
        QUESTION_ID AS "questionId",
        ANSWER_DATA AS "answerData",
        CREATED_AT AS "createdAt",
        POINTS,
        FEEDBACK
`;

export const getUnifiedGradingDataQuery = `
    SELECT
        QQ.MAX_POINTS AS "maxPoints",
        (
            SELECT COALESCE(json_agg(ID), '[]'::json)
            FROM QUESTION_OPTIONS
            WHERE QUESTION_ID = $2 AND IS_CORRECT = TRUE
        ) AS "correctOptionIds",
        (
            SELECT COALESCE(json_agg(
                json_build_object('answer', ANSWER, 'blankIndex', BLANK_INDEX)
            ), '[]'::json)
            FROM ANSWERS
            WHERE QUESTION_ID = $2
        ) AS "validAnswers"
    FROM
        QUIZ_ATTEMPTS QA
    INNER JOIN
        QUIZ_QUESTIONS QQ ON QQ.QUIZ_ID = QA.QUIZ_ID AND QQ.QUESTION_ID = $2
    WHERE
        QA.ID = $1
`;

export const submitQuizAttemptQuery = `
    UPDATE
        QUIZ_ATTEMPTS
    SET
        COMPLETED_AT = CURRENT_TIMESTAMP,
        POINTS = COALESCE((
            SELECT
                SUM(COALESCE(POINTS, 0))
            FROM
                STUDENT_ANSWERS
            WHERE
                ATTEMPT_ID = $1
        ), 0)
    WHERE
        ID = $1
        AND COMPLETED_AT IS NULL
    RETURNING
        ID,
        USER_ID AS "userId",
        QUIZ_ID AS "quizId",
        POINTS,
        STARTED_AT AS "startedAt",
        COMPLETED_AT AS "completedAt"
`;

export const markQuizAssignmentCompletedQuery = `
    UPDATE
        ASSIGNMENT_ITEMS AI
    SET
        STATUS = 'completed'
    FROM
        ASSIGNMENTS A
    WHERE
        AI.ASSIGNMENT_ID = A.ID
        AND A.USER_ID = $1           -- Match the student who took the quiz
        AND AI.CONTENT_ID = $2       -- Match the specific quiz
        AND AI.CONTENT_TYPE = 'quiz' -- Ensure we only update quiz items
        AND AI.STATUS != 'completed' -- Skip if already completed
`;
