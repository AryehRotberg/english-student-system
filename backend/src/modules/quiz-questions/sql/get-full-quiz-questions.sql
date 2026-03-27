SELECT
    QQ.ID AS id,
    QQ.QUESTION_ID AS "questionId",
    Q.QUESTION AS prompt,
    Q.QUESTION_TYPE AS "questionType",
    QQ.MAX_POINTS AS "maxPoints",
    (
        SELECT COALESCE(
            json_agg(
                json_build_object('id', QO.ID, 'value', QO.OPTION_TEXT, 'label', QO.OPTION_TEXT)
            ),
            '[]'::json
        )
        FROM QUESTION_OPTIONS QO
        WHERE QO.QUESTION_ID = QQ.QUESTION_ID
    ) AS options,
    (
        SELECT COALESCE(MAX(A.BLANK_INDEX), 0)
        FROM ANSWERS A
        WHERE A.QUESTION_ID = QQ.QUESTION_ID
    ) AS "blankCount"
FROM
    QUIZ_QUESTIONS QQ
    JOIN QUESTIONS Q ON QQ.QUESTION_ID = Q.ID
WHERE
    QQ.QUIZ_ID = $1
ORDER BY
    QQ.CREATED_AT ASC;