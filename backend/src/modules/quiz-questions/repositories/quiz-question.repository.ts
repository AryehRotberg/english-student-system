import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { QuizQuestion } from '../entities/quiz-question.entity';

@Injectable()
export class QuizQuestionRepository extends Repository<QuizQuestion> {
    private readonly FIND_FULL_QUIZ_SQL = `
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
    `;

    constructor(dataSource: DataSource) {
        super(QuizQuestion, dataSource.createEntityManager());
    }

    async getFullQuiz(quizId: string) {
        const questionsRaw = await this.query(this.FIND_FULL_QUIZ_SQL, [
            quizId,
        ]);

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
