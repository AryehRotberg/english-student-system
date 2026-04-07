-- Uses v_assignment_item_progress view (see backend/src/db/views/v_assignment_item_progress.sql)
SELECT
	P.CONTENT_TYPE AS "contentType",
	SUM(P.TOTAL_ITEMS)::INT AS "totalItems",
	SUM(P.COMPLETED_ITEMS)::INT AS "completedItems"
FROM
	V_ASSIGNMENT_ITEM_PROGRESS P
	JOIN PUBLIC.ASSIGNMENTS A ON A.ID = P.ASSIGNMENT_ID
WHERE
	A.USER_ID = $1
	AND A.STATUS = 'assigned'
GROUP BY
	P.CONTENT_TYPE;