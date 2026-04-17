import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { StudentAnswerResponseDto } from './dto/student-answer.response.dto';
import { StudentAnswerUpsertDto } from './dto/student-answer.upsert.dto';
import { CorrectOption, ValidAnswer } from './entities/grading-data';
import { StudentAnswersCommon } from './student-answers.common';

@Injectable()
export class StudentAnswersService {
    constructor(
        private readonly pgService: PostgresService,
        private readonly studentAnswersCommon: StudentAnswersCommon,
    ) {}

    async upsert(
        upsertStudentAnswerDto: StudentAnswerUpsertDto,
    ): Promise<StudentAnswerResponseDto[]> {
        const scores = await this.calculateAutomaticPoints(
            upsertStudentAnswerDto,
        );

        const {
            attemptId,
            questionId,
            selectedOptionId,
            textAnswers = [],
        } = upsertStudentAnswerDto;

        const arrays = this.studentAnswersCommon.prepareBulkUpsertArrays(
            selectedOptionId,
            textAnswers,
            scores,
        );

        return await this.pgService.query<StudentAnswerResponseDto>(
            this.pgService.getSql(__dirname, 'student-answer.upsert.sql'),
            [
                attemptId,
                questionId,
                arrays.blankIndices,
                arrays.optionIds,
                arrays.texts,
                arrays.points,
            ],
        );
    }

    async findAll(): Promise<StudentAnswerResponseDto[]> {
        return await this.pgService.query<StudentAnswerResponseDto>(
            this.pgService.getSql(__dirname, 'student-answer.find-all.sql'),
        );
    }

    async findOne(id: string): Promise<StudentAnswerResponseDto> {
        const [answer] = await this.pgService.query<StudentAnswerResponseDto>(
            this.pgService.getSql(__dirname, 'student-answer.find-by-id.sql'),
            [id],
        );
        return answer;
    }

    async findByAttempt(
        attemptId: string,
    ): Promise<StudentAnswerResponseDto[]> {
        return await this.pgService.query<StudentAnswerResponseDto>(
            this.pgService.getSql(
                __dirname,
                'student-answer.find-by-attempt.sql',
            ),
            [attemptId],
        );
    }

    async remove(id: string): Promise<StudentAnswerResponseDto> {
        const [result] = await this.pgService.query<StudentAnswerResponseDto>(
            this.pgService.getSql(__dirname, 'student-answer.delete.sql'),
            [id],
        );
        return result;
    }

    private async calculateAutomaticPoints(
        upsertStudentAnswerDto: StudentAnswerUpsertDto,
    ): Promise<number[]> {
        const { attemptId, questionId, selectedOptionId, textAnswers } =
            upsertStudentAnswerDto;

        if (selectedOptionId && textAnswers) {
            throw new BadRequestException(
                'Cannot provide both selected option and text answers',
            );
        }

        if (selectedOptionId) {
            const [result] = await this.pgService.query<CorrectOption>(
                this.pgService.getSql(
                    __dirname,
                    'student-answer.find-correct-options.sql',
                ),
                [attemptId, questionId],
            );

            if (!result) {
                throw new NotFoundException(
                    'Correct option not found for the given question and attempt',
                );
            }

            return result.correctOptionId === selectedOptionId
                ? [Number(result.maxPoints)]
                : [0];
        }

        if (textAnswers && textAnswers.length > 0) {
            const results = await this.pgService.query<ValidAnswer>(
                this.pgService.getSql(
                    __dirname,
                    'student-answer.find-valid-answers.sql',
                ),
                [attemptId, questionId],
            );

            if (!results || results.length === 0) {
                throw new NotFoundException(
                    'Valid answers not found for the given question and attempt',
                );
            }

            const groupedResults =
                this.studentAnswersCommon.groupResultsByBlankIndex(results);
            const maxPointsPerBlank =
                this.studentAnswersCommon.distributePoints(
                    Number(results[0].questionMaxPoints),
                    groupedResults.length,
                );

            return textAnswers.map((submittedAnswer, i) => {
                const truth = groupedResults[i];
                if (!truth) return 0;

                const normalizedInput =
                    this.studentAnswersCommon.normalizeAnswer(submittedAnswer);
                const isCorrect = truth.validAnswers.some(
                    (variant) =>
                        this.studentAnswersCommon.normalizeAnswer(variant) ===
                        normalizedInput,
                );

                return isCorrect ? maxPointsPerBlank[i] : 0;
            });
        }

        return [];
    }
}
