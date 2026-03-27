import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { QuizAttemptResponseDto } from '../quiz-attempts/dto/quiz-attempt-response.dto';
import { QuizAttempt } from '../quiz-attempts/entities/quiz-attempt.entity';
import { PostgresService } from '../../config/postgres.client';
import { StudentAnswerResponseDto } from './dto/student-answer-response.dto';
import { UpsertStudentAnswerDto } from './dto/upsert-student-answer.dto';
import { StudentAnswer } from './entities/student-answer.entity';
import {
    deleteStudentAnswerQuery,
    getAllStudentAnswersQuery,
    getStudentAnswerByIdQuery,
    getUnifiedGradingDataQuery,
    markQuizAssignmentCompletedQuery,
    submitQuizAttemptQuery,
    upsertStudentAnswerQuery,
} from './student-answers.queries';

type StudentAnswerData = {
    questionId?: string;
    selectedOptionId?: string;
    answers?: string[];
};

type UnifiedGradingData = {
    maxPoints: number | string;
    correctOptionIds: string[];
    validAnswers: { answer: string; blankIndex: number | string }[];
};

@Injectable()
export class StudentAnswersService {
    constructor(private readonly postgresService: PostgresService) {}

    async upsert(
        upsertStudentAnswerDto: UpsertStudentAnswerDto,
    ): Promise<StudentAnswerResponseDto> {
        const { attemptId, questionId, answerData } = upsertStudentAnswerDto;
        const normalizedAnswerData = this.validateAnswerData(
            questionId,
            answerData,
        );
        const computedPoints = await this.calculateAutomaticPoints(
            attemptId,
            questionId,
            normalizedAnswerData,
        );

        const [result] = await this.postgresService.query<StudentAnswer>(
            upsertStudentAnswerQuery,
            [
                attemptId,
                questionId,
                normalizedAnswerData,
                computedPoints,
                upsertStudentAnswerDto.feedback ?? null,
            ],
        );

        return StudentAnswerResponseDto.fromEntity(result);
    }

    async findAll(): Promise<StudentAnswerResponseDto[]> {
        const answers = await this.postgresService.query<StudentAnswer>(
            getAllStudentAnswersQuery,
        );
        return StudentAnswerResponseDto.fromEntities(answers);
    }

    async findOne(id: string): Promise<StudentAnswerResponseDto> {
        const [answer] = await this.postgresService.query<StudentAnswer>(
            getStudentAnswerByIdQuery,
            [id],
        );

        if (!answer) {
            throw new NotFoundException('Student answer not found');
        }

        return StudentAnswerResponseDto.fromEntity(answer);
    }

    async remove(id: string): Promise<StudentAnswerResponseDto> {
        const [result] = await this.postgresService.query<StudentAnswer>(
            deleteStudentAnswerQuery,
            [id],
        );

        return StudentAnswerResponseDto.fromEntity(result);
    }

    async submitAttempt(attemptId: string): Promise<QuizAttempt> {
        const [updatedAttempt] = await this.postgresService.query<QuizAttempt>(
            submitQuizAttemptQuery,
            [attemptId],
        );

        await this.postgresService.query(markQuizAssignmentCompletedQuery, [
            updatedAttempt.userId,
            updatedAttempt.quizId,
        ]);

        return QuizAttemptResponseDto.fromEntity(updatedAttempt);
    }

    private validateAnswerData(
        questionId: string,
        answerData: unknown,
    ): StudentAnswerData {
        if (
            !answerData ||
            typeof answerData !== 'object' ||
            Array.isArray(answerData)
        ) {
            throw new BadRequestException('answerData must be an object');
        }

        const parsedAnswerData = answerData as StudentAnswerData;
        const hasSelectedOption =
            typeof parsedAnswerData.selectedOptionId === 'string';
        const hasAnswers = Array.isArray(parsedAnswerData.answers);

        if (
            parsedAnswerData.questionId &&
            parsedAnswerData.questionId !== questionId
        ) {
            throw new BadRequestException(
                'answerData.questionId must match questionId',
            );
        }

        if (hasSelectedOption === hasAnswers) {
            throw new BadRequestException(
                'answerData must contain exactly one of selectedOptionId or answers',
            );
        }

        if (
            hasAnswers &&
            parsedAnswerData.answers?.some(
                (answer) => typeof answer !== 'string',
            )
        ) {
            throw new BadRequestException(
                'answerData.answers must be an array of strings',
            );
        }

        return {
            questionId,
            selectedOptionId: parsedAnswerData.selectedOptionId,
            answers: parsedAnswerData.answers,
        };
    }

    private async calculateAutomaticPoints(
        attemptId: string,
        questionId: string,
        answerData: StudentAnswerData,
    ): Promise<number> {
        const [gradingData] =
            await this.postgresService.query<UnifiedGradingData>(
                getUnifiedGradingDataQuery,
                [attemptId, questionId],
            );

        if (!gradingData || gradingData.maxPoints === null) {
            throw new BadRequestException(
                'Question does not belong to the quiz attempt',
            );
        }

        const maxPoints = Number(gradingData.maxPoints);

        if (answerData.selectedOptionId) {
            return gradingData.correctOptionIds.includes(
                answerData.selectedOptionId,
            )
                ? maxPoints
                : 0;
        }

        if (gradingData.validAnswers.length === 0) {
            return 0;
        }

        const expectedAnswersByBlank = new Map<number, Set<string>>();

        for (const validAnswer of gradingData.validAnswers) {
            const blankIndex = Number(validAnswer.blankIndex);
            const normalizedAnswer = this.normalizeAnswer(validAnswer.answer);

            if (!expectedAnswersByBlank.has(blankIndex)) {
                expectedAnswersByBlank.set(blankIndex, new Set<string>());
            }

            expectedAnswersByBlank.get(blankIndex)?.add(normalizedAnswer);
        }

        const blankIndexes = Array.from(expectedAnswersByBlank.keys()).sort(
            (a, b) => a - b,
        );
        const submittedAnswers = answerData.answers ?? [];

        if (blankIndexes.length === 0 || submittedAnswers.length === 0) {
            return 0;
        }

        let correctAnswersCount = 0;

        for (const blankIndex of blankIndexes) {
            const submittedAnswer = submittedAnswers[blankIndex - 1];
            if (!submittedAnswer) continue;

            const normalizedAnswer = this.normalizeAnswer(submittedAnswer);
            const acceptedAnswers = expectedAnswersByBlank.get(blankIndex);

            if (acceptedAnswers?.has(normalizedAnswer)) {
                correctAnswersCount += 1;
            }
        }

        const points = (correctAnswersCount / blankIndexes.length) * maxPoints;
        return Number(points.toFixed(2));
    }

    private normalizeAnswer(answer: string): string {
        return answer
            .trim()
            .toLowerCase()
            .replace(/[’`]/g, "'")
            .replace(/\s+/g, ' ');
    }
}
