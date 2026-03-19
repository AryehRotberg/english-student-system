export const getQuizQuestionsByQuizIdQuery = `
    SELECT
        QQ.ID,
        QQ.QUIZ_ID AS "quizId",
        QQ.QUESTION_ID AS "questionId",
        Q.QUESTION,
        Q.QUESTION_TYPE AS "questionType",
        Q.AUDIO_URL AS "audioUrl",
        QQ.MAX_POINTS AS "maxPoints"
    FROM
        QUIZ_QUESTIONS QQ
        JOIN QUESTIONS Q ON QQ.QUESTION_ID = Q.ID
    WHERE
        QQ.QUIZ_ID = $1;
`;

export const getQuizQuestionByIdQuery = `
    SELECT
        QQ.ID,
        QQ.QUIZ_ID AS "quizId",
        QQ.QUESTION_ID AS "questionId",
        Q.QUESTION,
        Q.QUESTION_TYPE AS "questionType",
        Q.AUDIO_URL AS "audioUrl",
        QQ.MAX_POINTS AS "maxPoints"
    FROM
        QUIZ_QUESTIONS QQ
        JOIN QUESTIONS Q ON QQ.QUESTION_ID = Q.ID
    WHERE
        QQ.ID = $1;
`;

export const createQuizQuestionQuery = `
    WITH inserted AS (
        INSERT INTO
            QUIZ_QUESTIONS (QUIZ_ID, QUESTION_ID, MAX_POINTS)
        VALUES
            ($1, $2, $3)
        RETURNING
            ID,
            QUIZ_ID,
            QUESTION_ID,
            MAX_POINTS
    )
    SELECT
        I.ID,
        I.QUIZ_ID AS "quizId",
        I.QUESTION_ID AS "questionId",
        Q.QUESTION,
        Q.QUESTION_TYPE AS "questionType",
        Q.AUDIO_URL AS "audioUrl",
        I.MAX_POINTS AS "maxPoints"
    FROM
        inserted I
        JOIN QUESTIONS Q ON I.QUESTION_ID = Q.ID
`;

export const updateQuizQuestionQuery = `
    WITH updated AS (
        UPDATE
            QUIZ_QUESTIONS
        SET
            QUIZ_ID = COALESCE($2, QUIZ_ID),
            QUESTION_ID = COALESCE($3, QUESTION_ID),
            MAX_POINTS = COALESCE($4, MAX_POINTS)
        WHERE
            ID = $1
        RETURNING
            ID,
            QUIZ_ID,
            QUESTION_ID,
            MAX_POINTS
    )
    SELECT
        U.ID,
        U.QUIZ_ID AS "quizId",
        U.QUESTION_ID AS "questionId",
        Q.QUESTION,
        Q.QUESTION_TYPE AS "questionType",
        Q.AUDIO_URL AS "audioUrl",
        U.MAX_POINTS AS "maxPoints"
    FROM
        updated U
        JOIN QUESTIONS Q ON U.QUESTION_ID = Q.ID
`;
