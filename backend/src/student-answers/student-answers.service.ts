import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../config/postgres.client';
import { CreateStudentAnswerDto } from './dto/create-student-answer.dto';
import { StudentAnswerResponseDto } from './dto/student-answer-response.dto';
import { UpdateStudentAnswerDto } from './dto/update-student-answer.dto';
import { StudentAnswer } from './entities/student-answer.entity';
import {
    createStudentAnswerQuery,
    deleteStudentAnswerQuery,
    getAllStudentAnswersQuery,
    getCorrectQuestionOptionIdsQuery,
    getGradingContextQuery,
    getStudentAnswerByAttemptAndQuestionQuery,
    getStudentAnswerByIdQuery,
    getValidAnswersByQuestionIdQuery,
    recalculateQuizAttemptPointsQuery,
    updateStudentAnswerQuery,
} from './student-answers.queries';

type StudentAnswerData = {
    questionId?: string;
    selectedOptionId?: string;
    answers?: string[];
};

type GradingContext = {
    attemptId: string;
    quizId: string;
    maxPoints: number | string | null;
};

type ValidAnswerRow = {
    answer: string;
    blankIndex: number | string;
};

type CorrectQuestionOptionRow = {
    id: string;
};

@Injectable()
export class StudentAnswersService {
    constructor(private readonly postgresService: PostgresService) { }

    async create(createStudentAnswerDto: CreateStudentAnswerDto): Promise<StudentAnswerResponseDto> {
        const { attemptId, questionId, answerData } = createStudentAnswerDto;
        const normalizedAnswerData = this.validateAnswerData(questionId, answerData);
        const computedPoints = await this.calculateAutomaticPoints(attemptId, questionId, normalizedAnswerData);

        const [existingAnswer] = await this.postgresService.query<StudentAnswer>(
            getStudentAnswerByAttemptAndQuestionQuery,
            [attemptId, questionId],
        );

        if (existingAnswer) {
            return await this.update(existingAnswer.id, {
                answerData: normalizedAnswerData,
                feedback: createStudentAnswerDto.feedback,
            });
        }

        const [result] = await this.postgresService.query<StudentAnswer>(
            createStudentAnswerQuery,
            [attemptId, questionId, normalizedAnswerData, computedPoints, createStudentAnswerDto.feedback ?? null],
        );

        await this.syncQuizAttemptPoints(attemptId);

        return StudentAnswerResponseDto.fromEntity(result);
    }

    async findAll(): Promise<StudentAnswerResponseDto[]> {
        const answers = await this.postgresService.query<StudentAnswer>(getAllStudentAnswersQuery);
        return StudentAnswerResponseDto.fromEntities(answers);
    }

    async findOne(id: string): Promise<StudentAnswerResponseDto> {
        const [answer] = await this.postgresService.query<StudentAnswer>(getStudentAnswerByIdQuery, [id]);

        if (!answer) {
            throw new NotFoundException('Student answer not found');
        }

        return StudentAnswerResponseDto.fromEntity(answer);
    }

    async update(
        id: string,
        updateStudentAnswerDto: UpdateStudentAnswerDto,
    ): Promise<StudentAnswerResponseDto> {
        const existingAnswer = await this.findOne(id);
        const answerData = this.validateAnswerData(
            existingAnswer.questionId,
            updateStudentAnswerDto.answerData ?? existingAnswer.answerData,
        );

        const computedPoints = updateStudentAnswerDto.points ?? await this.calculateAutomaticPoints(
            existingAnswer.attemptId,
            existingAnswer.questionId,
            answerData,
        );

        const [result] = await this.postgresService.query<StudentAnswer>(
            updateStudentAnswerQuery,
            [
                id,
                answerData,
                computedPoints,
                updateStudentAnswerDto.feedback ?? existingAnswer.feedback,
            ],
        );

        await this.syncQuizAttemptPoints(existingAnswer.attemptId);

        return StudentAnswerResponseDto.fromEntity(result);
    }

    async remove(id: string): Promise<StudentAnswerResponseDto> {
        const existingAnswer = await this.findOne(id);

        const [result] = await this.postgresService.query<StudentAnswer>(deleteStudentAnswerQuery, [id]);

        await this.syncQuizAttemptPoints(existingAnswer.attemptId);

        return StudentAnswerResponseDto.fromEntity(result);
    }

    private validateAnswerData(questionId: string, answerData: unknown): StudentAnswerData {
        if (!answerData || typeof answerData !== 'object' || Array.isArray(answerData)) {
            throw new BadRequestException('answerData must be an object');
        }

        const parsedAnswerData = answerData as StudentAnswerData;
        const hasSelectedOption = typeof parsedAnswerData.selectedOptionId === 'string';
        const hasAnswers = Array.isArray(parsedAnswerData.answers);

        if (parsedAnswerData.questionId && parsedAnswerData.questionId !== questionId) {
            throw new BadRequestException('answerData.questionId must match questionId');
        }

        if (hasSelectedOption === hasAnswers) {
            throw new BadRequestException(
                'answerData must contain exactly one of selectedOptionId or answers',
            );
        }

        if (hasAnswers && parsedAnswerData.answers?.some((answer) => typeof answer !== 'string')) {
            throw new BadRequestException('answerData.answers must be an array of strings');
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
        const [gradingContext] = await this.postgresService.query<GradingContext>(
            getGradingContextQuery,
            [attemptId, questionId],
        );

        if (!gradingContext || gradingContext.maxPoints === null) {
            throw new BadRequestException('Question does not belong to the quiz attempt');
        }

        const maxPoints = Number(gradingContext.maxPoints);

        if (answerData.selectedOptionId) {
            const correctOptions = await this.postgresService.query<CorrectQuestionOptionRow>(
                getCorrectQuestionOptionIdsQuery,
                [questionId],
            );

            return correctOptions.some((option) => option.id === answerData.selectedOptionId)
                ? maxPoints
                : 0;
        }

        const validAnswers = await this.postgresService.query<ValidAnswerRow>(
            getValidAnswersByQuestionIdQuery,
            [questionId],
        );

        if (validAnswers.length === 0) {
            return 0;
        }

        const expectedAnswersByBlank = new Map<number, Set<string>>();

        for (const validAnswer of validAnswers) {
            const blankIndex = Number(validAnswer.blankIndex);
            const normalizedAnswer = this.normalizeAnswer(validAnswer.answer);

            if (!expectedAnswersByBlank.has(blankIndex)) {
                expectedAnswersByBlank.set(blankIndex, new Set<string>());
            }

            expectedAnswersByBlank.get(blankIndex)?.add(normalizedAnswer);
        }

        const blankIndexes = Array.from(expectedAnswersByBlank.keys()).sort((left, right) => left - right);
        const submittedAnswers = answerData.answers ?? [];

        if (blankIndexes.length === 0 || submittedAnswers.length === 0) {
            return 0;
        }

        let correctAnswersCount = 0;

        for (const blankIndex of blankIndexes) {
            const submittedAnswer = submittedAnswers[blankIndex - 1];

            if (!submittedAnswer) {
                continue;
            }

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

    private async syncQuizAttemptPoints(attemptId: string): Promise<void> {
        await this.postgresService.query(recalculateQuizAttemptPointsQuery, [attemptId]);
    }
}
