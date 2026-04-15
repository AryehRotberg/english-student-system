import {
    BadRequestException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { StudentAnswerResponseDto } from './dto/student-answer-response.dto';
import { UpsertStudentAnswerDto } from './dto/upsert-student-answer.dto';
import { CorrectOption, ValidAnswer } from './entities/grading-data';
import { StudentAnswer } from './entities/student-answer.entity';
import { StudentAnswersCommon } from './student-answers.common';

@Injectable()
export class StudentAnswersService {
    constructor(
        private readonly pgService: PostgresService,
        private readonly studentAnswersCommon: StudentAnswersCommon,
    ) {}

    async upsert(
        upsertStudentAnswerDto: UpsertStudentAnswerDto,
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

        const results = await this.pgService.query<StudentAnswer>(
            this.pgService.getSql(__dirname, 'upsert-student-answer.sql'),
            [
                attemptId,
                questionId,
                arrays.blankIndices,
                arrays.optionIds,
                arrays.texts,
                arrays.points,
            ],
        );

        return StudentAnswerResponseDto.fromEntities(results);
    }

    async findAll(): Promise<StudentAnswerResponseDto[]> {
        const answers = await this.pgService.query<StudentAnswer>(
            this.pgService.getSql(__dirname, 'get-all-student-answers.sql'),
        );
        return StudentAnswerResponseDto.fromEntities(answers);
    }

    async findOne(id: string): Promise<StudentAnswerResponseDto> {
        const [answer] = await this.pgService.query<StudentAnswer>(
            this.pgService.getSql(__dirname, 'get-student-answer-by-id.sql'),
            [id],
        );

        if (!answer) {
            throw new NotFoundException('Student answer not found');
        }

        return StudentAnswerResponseDto.fromEntity(answer);
    }

    async findByAttempt(
        attemptId: string,
    ): Promise<StudentAnswerResponseDto[]> {
        const answers = await this.pgService.query<StudentAnswer>(
            this.pgService.getSql(
                __dirname,
                'get-student-answers-by-attempt.sql',
            ),
            [attemptId],
        );
        return StudentAnswerResponseDto.fromEntities(answers);
    }

    async remove(id: string): Promise<StudentAnswerResponseDto> {
        const [result] = await this.pgService.query<StudentAnswer>(
            this.pgService.getSql(__dirname, 'delete-student-answer.sql'),
            [id],
        );

        return StudentAnswerResponseDto.fromEntity(result);
    }

    private async calculateAutomaticPoints(
        upsertStudentAnswerDto: UpsertStudentAnswerDto,
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
                this.pgService.getSql(__dirname, 'get-correct-options.sql'),
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
                this.pgService.getSql(__dirname, 'get-valid-answers.sql'),
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
