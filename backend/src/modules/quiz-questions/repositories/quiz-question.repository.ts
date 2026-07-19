import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuizQuestion } from '../entities/quiz-question.entity';

// CTE is named QUESTION_LIST (not QUIZ_QUESTIONS) to avoid shadowing the real table.
const FIND_FULL_QUIZ_SQL = `
    WITH
        QUESTION_LIST AS (
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
        OPTIONS_BY_QUESTION AS (
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
                ) AS OPTIONS
            FROM
                QUESTION_CHOICES QO
                JOIN QUESTION_LIST QL ON QL.QUESTION_ID = QO.QUESTION_ID
            GROUP BY
                QO.QUESTION_ID
        ),
        BLANKS_BY_QUESTION AS (
            SELECT
                A.QUESTION_ID,
                MAX(A.BLANK_INDEX) AS BLANK_COUNT
            FROM
                QUESTION_ACCEPTED_ANSWERS A
                JOIN QUESTION_LIST QL ON QL.QUESTION_ID = A.QUESTION_ID
            GROUP BY
                A.QUESTION_ID
        )
    SELECT
        QL.ID AS ID,
        QL.QUESTION_ID AS "questionId",
        Q.QUESTION AS "prompt",
        Q.HINTS AS "hints",
        Q.QUESTION_TYPE AS "questionType",
        QL.MAX_POINTS AS "maxPoints",
        COALESCE(OBQ.OPTIONS, '[]'::json) AS OPTIONS,
        COALESCE(BBQ.BLANK_COUNT, 0) AS "blankCount"
    FROM
        QUESTION_LIST QL
        JOIN QUESTIONS Q ON QL.QUESTION_ID = Q.ID
        LEFT JOIN OPTIONS_BY_QUESTION OBQ ON OBQ.QUESTION_ID = QL.QUESTION_ID
        LEFT JOIN BLANKS_BY_QUESTION BBQ ON BBQ.QUESTION_ID = QL.QUESTION_ID
    ORDER BY
        QL.ORDER_INDEX ASC;
    `;

@Injectable()
export class QuizQuestionRepository extends Repository<QuizQuestion> {
    constructor(dataSource: DataSource) {
        super(QuizQuestion, dataSource.createEntityManager());
    }

    async getFullQuiz(quizId: string) {
        const questionsRaw = await this.query(FIND_FULL_QUIZ_SQL, [quizId]);

        return questionsRaw.map((q, index) => ({
            ...q,
            maxPoints: Number(q.maxPoints ?? 0),
            questionNumber: index + 1,
            totalQuestions: questionsRaw.length,
            blankCount: Number(q.blankCount ?? 0),
            questionType:
                q.questionType ??
                (q.options.length > 0 ? 'multiple_choice' : 'open_ended'),
        }));
    }
}
