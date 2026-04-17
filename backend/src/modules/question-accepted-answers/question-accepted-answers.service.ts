import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuestionAcceptedAnswerCreateDto } from './dto/question-accepted-answer.create.dto';
import { QuestionAcceptedAnswerResponseDto } from './dto/question-accepted-answer.response.dto';
import { QuestionAcceptedAnswerUpdateDto } from './dto/question-accepted-answer.update.dto';

@Injectable()
export class QuestionAcceptedAnswersService {
    constructor(private readonly pgService: PostgresService) {}

    async create(
        createQuestionAcceptedAnswerDto: QuestionAcceptedAnswerCreateDto,
    ): Promise<QuestionAcceptedAnswerResponseDto> {
        const { questionId, answer, blankIndex } =
            createQuestionAcceptedAnswerDto;

        const [result] =
            await this.pgService.query<QuestionAcceptedAnswerResponseDto>(
                this.pgService.getSql(
                    __dirname,
                    'question-accepted-answer.create.sql',
                ),
                [questionId, answer, blankIndex],
            );
        return result;
    }

    async findAll(): Promise<QuestionAcceptedAnswerResponseDto[]> {
        return await this.pgService.query<QuestionAcceptedAnswerResponseDto>(
            this.pgService.getSql(
                __dirname,
                'question-accepted-answer.find-all.sql',
            ),
        );
    }

    async findOne(id: string): Promise<QuestionAcceptedAnswerResponseDto> {
        const [answer] =
            await this.pgService.query<QuestionAcceptedAnswerResponseDto>(
                this.pgService.getSql(
                    __dirname,
                    'question-accepted-answer.find-by-id.sql',
                ),
                [id],
            );

        return answer;
    }

    async update(
        id: string,
        updateQuestionAcceptedAnswerDto: QuestionAcceptedAnswerUpdateDto,
    ): Promise<QuestionAcceptedAnswerResponseDto> {
        const [result] =
            await this.pgService.query<QuestionAcceptedAnswerResponseDto>(
                this.pgService.getSql(
                    __dirname,
                    'question-accepted-answer.update.sql',
                ),
                [
                    id,
                    updateQuestionAcceptedAnswerDto.questionId ?? null,
                    updateQuestionAcceptedAnswerDto.answer ?? null,
                    updateQuestionAcceptedAnswerDto.blankIndex ?? null,
                ],
            );
        return result;
    }

    async remove(id: string): Promise<QuestionAcceptedAnswerResponseDto> {
        const [result] =
            await this.pgService.query<QuestionAcceptedAnswerResponseDto>(
                this.pgService.getSql(
                    __dirname,
                    'question-accepted-answer.delete.sql',
                ),
                [id],
            );
        return result;
    }
}
