export const getAllQuizzesQuery = `
    SELECT
        ID,
        TITLE,
        DESCRIPTION,
        CREATED_AT AS "createdAt"
    FROM
        QUIZZES;
`;

export const createQuizQuery = `
    INSERT INTO
        QUIZZES (TITLE, DESCRIPTION)
    VALUES
        ($1, $2)
    RETURNING
        ID,
        TITLE,
        DESCRIPTION;
`;

export const getQuizTopicsByQuizIdQuery = `
    SELECT
        T.ID,
        T.TOPIC,
        T.EXPLANATION
    FROM
        QUIZ_TOPICS QT
    INNER JOIN
        TOPICS T ON T.ID = QT.TOPIC_ID
    WHERE
        QT.QUIZ_ID = $1
    ORDER BY
        T.TOPIC ASC;
`;