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
    QA.ID = $1;