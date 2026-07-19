import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

const FIND_CONTENT_PROGRESS_SQL = `
    SELECT
        P.CONTENT_TYPE AS "contentType",
        SUM(P.TOTAL_ITEMS)::INT AS "totalItems",
        SUM(P.COMPLETED_ITEMS)::INT AS "completedItems"
    FROM
        V_ASSIGNMENT_ITEM_PROGRESS P
        JOIN ASSIGNMENTS A ON A.ID = P.ASSIGNMENT_ID
    WHERE
        A.USER_ID = $1
        AND A.IS_COMPLETED = FALSE
    GROUP BY
        P.CONTENT_TYPE;
    `;

const FIND_QUIZ_PROGRESS_SQL = `
    WITH
        USER_QUIZZES AS (
            SELECT
                AI.CONTENT_ID AS QUIZ_ID,
                AI.IS_COMPLETED
            FROM
                ASSIGNMENT_ITEMS AI
                JOIN ASSIGNMENTS A ON AI.ASSIGNMENT_ID = A.ID
            WHERE
                A.USER_ID = $1
                AND A.IS_COMPLETED = FALSE
                AND AI.CONTENT_TYPE = 'quiz'
        ),
        LATEST_ATTEMPTS AS (
            SELECT DISTINCT
                ON (QUIZ_ID) ID AS ATTEMPT_ID,
                QUIZ_ID,
                COMPLETED_AT
            FROM
                QUIZ_ATTEMPTS
            WHERE
                USER_ID = $1
            ORDER BY
                QUIZ_ID,
                STARTED_AT DESC
        ),
        QUIZ_TOTALS AS (
            SELECT
                QUIZ_ID,
                COUNT(ID) AS TOTAL_QUESTIONS
            FROM
                QUIZ_QUESTIONS
            GROUP BY
                QUIZ_ID
        ),
        ATTEMPT_ANSWERS AS (
            SELECT
                ATTEMPT_ID,
                COUNT(DISTINCT QUESTION_ID) AS ANSWERED_QUESTIONS
            FROM
                STUDENT_ANSWERS
            GROUP BY
                ATTEMPT_ID
        )
    SELECT
        UQ.QUIZ_ID AS "quizId",
        UQ.IS_COMPLETED AS "assignmentStatus",
        LA.COMPLETED_AT AS "completedAt",
        COALESCE(QT.TOTAL_QUESTIONS, 0)::INT AS "totalQuestions",
        COALESCE(AA.ANSWERED_QUESTIONS, 0)::INT AS "answeredQuestions"
    FROM
        USER_QUIZZES UQ
        LEFT JOIN LATEST_ATTEMPTS LA ON UQ.QUIZ_ID = LA.QUIZ_ID
        LEFT JOIN QUIZ_TOTALS QT ON UQ.QUIZ_ID = QT.QUIZ_ID
        LEFT JOIN ATTEMPT_ANSWERS AA ON LA.ATTEMPT_ID = AA.ATTEMPT_ID;
    `;

@Injectable()
export class DashboardRepository {
    constructor(private readonly dataSource: DataSource) {}

    async findContentProgress(userId: string) {
        return this.dataSource.query(FIND_CONTENT_PROGRESS_SQL, [userId]);
    }

    async findQuizProgress(userId: string) {
        return this.dataSource.query(FIND_QUIZ_PROGRESS_SQL, [userId]);
    }
}
