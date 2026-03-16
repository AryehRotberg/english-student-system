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

export const getStudentAnswerByAttemptAndQuestionQuery = `
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
        ATTEMPT_ID = $1
        AND QUESTION_ID = $2
    ORDER BY
        CREATED_AT DESC
    LIMIT 1
`;

export const createStudentAnswerQuery = `
    INSERT INTO
        STUDENT_ANSWERS (ATTEMPT_ID, QUESTION_ID, ANSWER_DATA, POINTS, FEEDBACK)
    VALUES
        ($1, $2, $3, $4, $5)
    RETURNING
        ID,
        ATTEMPT_ID AS "attemptId",
        QUESTION_ID AS "questionId",
        ANSWER_DATA AS "answerData",
        CREATED_AT AS "createdAt",
        POINTS,
        FEEDBACK
`;

export const updateStudentAnswerQuery = `
    UPDATE
        STUDENT_ANSWERS
    SET
        ANSWER_DATA = $2,
        POINTS = $3,
        FEEDBACK = $4
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

export const getGradingContextQuery = `
    SELECT
        QA.ID AS "attemptId",
        QA.QUIZ_ID AS "quizId",
        QQ.MAX_POINTS AS "maxPoints"
    FROM
        QUIZ_ATTEMPTS QA
        LEFT JOIN QUIZ_QUESTIONS QQ ON QQ.QUIZ_ID = QA.QUIZ_ID AND QQ.QUESTION_ID = $2
    WHERE
        QA.ID = $1
`;

export const getCorrectQuestionOptionIdsQuery = `
    SELECT
        ID
    FROM
        QUESTION_OPTIONS
    WHERE
        QUESTION_ID = $1
        AND IS_CORRECT = TRUE
`;

export const getValidAnswersByQuestionIdQuery = `
    SELECT
        ANSWER,
        BLANK_INDEX AS "blankIndex"
    FROM
        ANSWERS
    WHERE
        QUESTION_ID = $1
    ORDER BY
        BLANK_INDEX ASC,
        CREATED_AT ASC
`;

export const recalculateQuizAttemptPointsQuery = `
    UPDATE
        QUIZ_ATTEMPTS
    SET
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
`;