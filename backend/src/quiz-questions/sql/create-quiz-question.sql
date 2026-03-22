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
    JOIN QUESTIONS Q ON I.QUESTION_ID = Q.ID;