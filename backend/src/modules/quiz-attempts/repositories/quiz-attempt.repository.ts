import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuizAttempt } from '../entities/quiz-attempt.entity';

const SUBMIT_SQL = `
    WITH
        UPDATED_ATTEMPT AS (
            UPDATE QUIZ_ATTEMPTS
            SET
                COMPLETED_AT = CURRENT_TIMESTAMP,
                POINTS = COALESCE(
                    (
                        SELECT
                            SUM(COALESCE(POINTS, 0))
                        FROM
                            STUDENT_ANSWERS
                        WHERE
                            ATTEMPT_ID = $1
                    ),
                    0
                )
            WHERE
                ID = $1
                AND COMPLETED_AT IS NULL
            RETURNING
                ID,
                USER_ID,
                QUIZ_ID,
                POINTS,
                STARTED_AT,
                COMPLETED_AT
        ),
        COMPLETED_ASSIGNMENT AS (
            UPDATE ASSIGNMENT_ITEMS AI
            SET
                IS_COMPLETED = TRUE
            FROM
                ASSIGNMENTS A,
                UPDATED_ATTEMPT UA
            WHERE
                AI.ASSIGNMENT_ID = A.ID
                AND A.USER_ID = UA.USER_ID
                AND AI.CONTENT_TYPE = 'quiz'
                AND AI.CONTENT_ID = UA.QUIZ_ID
                AND AI.IS_COMPLETED = FALSE
        )
    SELECT
        ID AS "id",
        USER_ID AS "userId",
        QUIZ_ID AS "quizId",
        POINTS AS "points",
        STARTED_AT AS "startedAt",
        COMPLETED_AT AS "completedAt"
    FROM
        UPDATED_ATTEMPT;
    `;

@Injectable()
export class QuizAttemptRepository extends Repository<QuizAttempt> {
    constructor(dataSource: DataSource) {
        super(QuizAttempt, dataSource.createEntityManager());
    }

    async submitAttempt(attemptId: string): Promise<QuizAttempt> {
        const rawResults = await this.query(SUBMIT_SQL, [attemptId]);

        if (!rawResults || rawResults.length === 0) {
            throw new ForbiddenException(
                'Quiz attempt already submitted or does not exist.',
            );
        }

        return this.create(rawResults[0] as QuizAttempt);
    }
}
