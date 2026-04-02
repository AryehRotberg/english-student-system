SELECT
    QQ.max_points AS "questionMaxPoints",
    A.answer AS "validAnswer",
    A.blank_index AS "blankIndex"
FROM
    public.quiz_attempts QA
INNER JOIN
    public.quiz_questions QQ ON QQ.quiz_id = QA.quiz_id
INNER JOIN 
    public.answers A ON A.question_id = QQ.question_id
WHERE
    QA.id = $1 
    AND QQ.question_id = $2
ORDER BY 
    A.blank_index ASC;