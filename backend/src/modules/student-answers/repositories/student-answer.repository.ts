import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { StudentAnswer } from '../entities/student-answer.entity';

const FIND_CORRECT_OPTIONS_SQL = `
    SELECT
        QQ.MAX_POINTS AS "maxPoints",
        QO.ID::TEXT AS "correctOptionId"
    FROM
        QUIZ_ATTEMPTS QA
        INNER JOIN QUIZ_QUESTIONS QQ ON QQ.QUIZ_ID = QA.QUIZ_ID
        INNER JOIN QUESTION_CHOICES QO ON QO.QUESTION_ID = QQ.QUESTION_ID
    WHERE
        QA.ID = $1
        AND QQ.QUESTION_ID = $2
        AND QO.IS_CORRECT = TRUE;
    `;

const FIND_VALID_TEXT_ANSWERS_SQL = `
    SELECT
        QQ.MAX_POINTS AS "questionMaxPoints",
        A.ANSWER AS "validAnswer",
        A.BLANK_INDEX AS "blankIndex"
    FROM
        QUIZ_ATTEMPTS QA
        INNER JOIN QUIZ_QUESTIONS QQ ON QQ.QUIZ_ID = QA.QUIZ_ID
        INNER JOIN QUESTION_ACCEPTED_ANSWERS A ON A.QUESTION_ID = QQ.QUESTION_ID
    WHERE
        QA.ID = $1
        AND QQ.QUESTION_ID = $2
    ORDER BY
        A.BLANK_INDEX ASC;
    `;

const UPSERT_ANSWER_SQL = `
    INSERT INTO
        STUDENT_ANSWERS (
            ATTEMPT_ID,
            QUESTION_ID,
            BLANK_INDEX,
            SELECTED_OPTION_ID,
            TEXT_ANSWER,
            POINTS
        )
    SELECT
        $1::UUID,
        $2::UUID,
        (PAYLOAD ->> 'blankIndex')::INT,
        NULLIF(PAYLOAD ->> 'selectedOptionId', '')::UUID,
        NULLIF(PAYLOAD ->> 'textAnswer', ''),
        (PAYLOAD ->> 'points')::NUMERIC
    FROM
        JSONB_ARRAY_ELEMENTS($3::JSONB) AS PAYLOAD
        INNER JOIN QUIZ_ATTEMPTS QA ON QA.ID = $1::UUID
        AND QA.COMPLETED_AT IS NULL
    ON CONFLICT (ATTEMPT_ID, QUESTION_ID, BLANK_INDEX) DO UPDATE
    SET
        SELECTED_OPTION_ID = EXCLUDED.SELECTED_OPTION_ID,
        TEXT_ANSWER = EXCLUDED.TEXT_ANSWER,
        POINTS = EXCLUDED.POINTS,
        CREATED_AT = NOW()
    RETURNING
        ID,
        ATTEMPT_ID AS "attemptId",
        QUESTION_ID AS "questionId",
        BLANK_INDEX AS "blankIndex",
        SELECTED_OPTION_ID AS "selectedOptionId",
        TEXT_ANSWER AS "textAnswer",
        POINTS,
        CREATED_AT AS "createdAt";
    `;

@Injectable()
export class StudentAnswerRepository extends Repository<StudentAnswer> {
    constructor(dataSource: DataSource) {
        super(StudentAnswer, dataSource.createEntityManager());
    }

    async upsertAnswers(
        attemptId: string,
        questionId: string,
        payload: Array<any>,
    ): Promise<StudentAnswer[]> {
        const results = await this.query(UPSERT_ANSWER_SQL, [
            attemptId,
            questionId,
            JSON.stringify(payload),
        ]);

        if (!results || results.length === 0) {
            throw new NotFoundException(
                'Attempt is already completed or does not exist. Mutations locked.',
            );
        }

        return results;
    }

    async findCorrectOption(attemptId: string, questionId: string) {
        const results = await this.query(FIND_CORRECT_OPTIONS_SQL, [
            attemptId,
            questionId,
        ]);
        return results[0];
    }

    async findValidTextAnswers(attemptId: string, questionId: string) {
        return this.query(FIND_VALID_TEXT_ANSWERS_SQL, [attemptId, questionId]);
    }
}
