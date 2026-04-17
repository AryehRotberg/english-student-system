WITH
    quiz_questions AS (
        SELECT
            QQ.ID,
            QQ.QUESTION_ID,
            QQ.MAX_POINTS,
            QQ.ORDER_INDEX
        FROM
            QUIZ_QUESTIONS QQ
        WHERE
            QQ.QUIZ_ID = $1
    ),
    options_by_question AS (
        SELECT
            QO.QUESTION_ID,
            json_agg(
                json_build_object(
                    'id',
                    QO.ID,
                    'value',
                    QO.OPTION_TEXT,
                    'label',
                    QO.OPTION_TEXT
                )
                ORDER BY
                    QO.ID
            ) AS options
        FROM
            QUESTION_CHOICES QO
            JOIN quiz_questions QQ ON QQ.QUESTION_ID = QO.QUESTION_ID
        GROUP BY
            QO.QUESTION_ID
    ),
    blanks_by_question AS (
        SELECT
            A.QUESTION_ID,
            MAX(A.BLANK_INDEX) AS blank_count
        FROM
            QUESTION_ACCEPTED_ANSWERS A
            JOIN quiz_questions QQ ON QQ.QUESTION_ID = A.QUESTION_ID
        GROUP BY
            A.QUESTION_ID
    )
SELECT
    QQ.ID AS id,
    QQ.QUESTION_ID AS "questionId",
    Q.QUESTION AS "prompt",
    Q.HINTS AS "hints",
    Q.QUESTION_TYPE AS "questionType",
    QQ.MAX_POINTS AS "maxPoints",
    COALESCE(OBQ.OPTIONS, '[]'::json) AS options,
    COALESCE(BBQ.blank_count, 0) AS "blankCount"
FROM
    quiz_questions QQ
    JOIN QUESTIONS Q ON QQ.QUESTION_ID = Q.ID
    LEFT JOIN options_by_question OBQ ON OBQ.QUESTION_ID = QQ.QUESTION_ID
    LEFT JOIN blanks_by_question BBQ ON BBQ.QUESTION_ID = QQ.QUESTION_ID
ORDER BY
    QQ.ORDER_INDEX ASC;