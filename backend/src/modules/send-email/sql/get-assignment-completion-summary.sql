WITH
	ATTEMPT_DATA AS (
		SELECT
			QA.ID AS "attemptId",
			QA.USER_ID AS "userId",
			QA.QUIZ_ID AS "quizId",
			QA.POINTS,
			QA.COMPLETED_AT AS "completedAt",
			COALESCE(Q.TITLE, 'Quiz') AS "quizTitle"
		FROM
			QUIZ_ATTEMPTS QA
			LEFT JOIN QUIZZES Q ON Q.ID = QA.QUIZ_ID
		WHERE
			QA.ID = $1
	),
	QUIZ_TOTALS AS (
		SELECT
			AD."quizId",
			COALESCE(SUM(QQ.MAX_POINTS), 0) AS "totalPoints"
		FROM
			ATTEMPT_DATA AD
			LEFT JOIN QUIZ_QUESTIONS QQ ON QQ.QUIZ_ID = AD."quizId"
		GROUP BY
			AD."quizId"
	)
SELECT
	AD."attemptId",
	AD."quizTitle",
	AD.POINTS,
	AD."completedAt",
	QT."totalPoints",
	AD2."assignmentTitle",
	AP."completedItems",
	AP."totalItems"
FROM
	ATTEMPT_DATA AD
	LEFT JOIN QUIZ_TOTALS QT ON QT."quizId" = AD."quizId"
	LEFT JOIN LATERAL (
		SELECT
			A.ID AS "assignmentId",
			COALESCE(A.TITLE, 'Assignment') AS "assignmentTitle"
		FROM
			ASSIGNMENT_ITEMS AI
			JOIN ASSIGNMENTS A ON A.ID = AI.ASSIGNMENT_ID
		WHERE
			AI.CONTENT_TYPE = 'quiz'
			AND AI.CONTENT_ID = AD."quizId"
			AND A.USER_ID = AD."userId"
		ORDER BY
			A.CREATED_AT DESC
		LIMIT
			1
	) AD2 ON TRUE
	LEFT JOIN LATERAL (
		SELECT
			COALESCE(SUM(P.TOTAL_ITEMS), 0)::INT AS "totalItems",
			COALESCE(SUM(P.COMPLETED_ITEMS), 0)::INT AS "completedItems"
		FROM
			V_ASSIGNMENT_ITEM_PROGRESS P
		WHERE
			P.ASSIGNMENT_ID = AD2."assignmentId"
	) AP ON AD2."assignmentId" IS NOT NULL;