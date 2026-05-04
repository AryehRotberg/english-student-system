import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentAnswerUpsertDto } from './dto/student-answer.upsert.dto';
import { CorrectOption, ValidAnswer } from './entities/grading-data';
import { StudentAnswer } from './entities/student-answer.entity';
import { StudentAnswerRepository } from './repositories/student-answer.repository';
import { StudentAnswersCommon } from './student-answers.common';

@Injectable()
export class StudentAnswersService {
    constructor(
        @InjectRepository(StudentAnswer)
        private readonly answerRepo: StudentAnswerRepository,
        private readonly common: StudentAnswersCommon,
    ) {}

    async upsert(dto: StudentAnswerUpsertDto): Promise<StudentAnswer[]> {
        if (
            dto.selectedOptionId &&
            dto.textAnswers &&
            dto.textAnswers.length > 0
        ) {
            throw new BadRequestException(
                'Cannot provide both selected option and text answers',
            );
        }

        const payload = await this.buildGradingPayload(dto);

        const results = await this.answerRepo.upsertAnswers(
            dto.attemptId,
            dto.questionId,
            payload,
        );

        return results;
    }

    findOne(id: string): Promise<StudentAnswer | null> {
        return this.answerRepo.findOneBy({ id });
    }

    findByAttempt(attemptId: string): Promise<StudentAnswer[]> {
        return this.answerRepo.find({ where: { attemptId } });
    }

    async remove(id: string): Promise<StudentAnswer> {
        const entity = await this.answerRepo.findOneBy({ id });
        await this.answerRepo.delete(id);
        return entity!;
    }

    private async buildGradingPayload(
        dto: StudentAnswerUpsertDto,
    ): Promise<Array<any>> {
        if (dto.selectedOptionId) {
            const truth = (await this.answerRepo.findCorrectOption(
                dto.attemptId,
                dto.questionId,
            )) as CorrectOption;

            if (!truth)
                throw new NotFoundException('Correct option mapping not found');

            const points =
                truth.correctOptionId === dto.selectedOptionId
                    ? Number(truth.maxPoints)
                    : 0;

            return [
                {
                    blankIndex: 1,
                    selectedOptionId: dto.selectedOptionId,
                    textAnswer: null,
                    points: points,
                },
            ];
        }

        if (dto.textAnswers && dto.textAnswers.length > 0) {
            const truths = (await this.answerRepo.findValidTextAnswers(
                dto.attemptId,
                dto.questionId,
            )) as ValidAnswer[];

            if (!truths || truths.length === 0)
                throw new NotFoundException('Valid answers mapping not found');

            const groupedTruths = this.common.groupResultsByBlankIndex(truths);
            const distributedPoints = this.common.distributePoints(
                Number(truths[0].questionMaxPoints),
                groupedTruths.length,
            );

            return dto.textAnswers
                .map((submittedAnswer, i) => {
                    const truthGroup = groupedTruths[i];
                    if (!truthGroup) return null;

                    const normalizedInput =
                        this.common.normalizeAnswer(submittedAnswer);
                    const isCorrect = truthGroup.validAnswers.some(
                        (variant) =>
                            this.common.normalizeAnswer(variant) ===
                            normalizedInput,
                    );

                    return {
                        blankIndex: i + 1,
                        selectedOptionId: null,
                        textAnswer: submittedAnswer,
                        points: isCorrect ? distributedPoints[i] : 0,
                    };
                })
                .filter(Boolean);
        }

        throw new BadRequestException('Invalid payload shape');
    }
}
