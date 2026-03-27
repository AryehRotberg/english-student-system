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
    JOIN QUESTIONS Q ON U.QUESTION_ID = Q.ID;