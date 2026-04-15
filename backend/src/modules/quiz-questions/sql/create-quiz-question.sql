WITH inserted AS (
    INSERT INTO
        QUIZ_QUESTIONS (QUIZ_ID, QUESTION_ID, MAX_POINTS, ORDER_INDEX)
    VALUES
        ($1, $2, $3, $4)
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
    I.MAX_POINTS AS "maxPoints"
FROM
    inserted I
    JOIN QUESTIONS Q ON I.QUESTION_ID = Q.ID;