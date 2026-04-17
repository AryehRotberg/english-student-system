import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuestionChoiceCreateDto } from './dto/question-choice.create.dto';
import { QuestionChoiceQueryDto } from './dto/question-choice.query.dto';
import { QuestionChoiceResponseDto } from './dto/question-choice.response.dto';
import { QuestionChoiceUpdateDto } from './dto/question-choice.update.dto';

@Injectable()
export class QuestionChoicesService {
    constructor(private readonly pgService: PostgresService) {}

    async findByQuestionId(
        dto: QuestionChoiceQueryDto,
    ): Promise<QuestionChoiceResponseDto[]> {
        const { questionId } = dto;

        return await this.pgService.query<QuestionChoiceResponseDto>(
            this.pgService.getSql(
                __dirname,
                'question-choice.find-by-question-id.sql',
            ),
            [questionId],
        );
    }

    async create(
        createQuestionChoiceDto: QuestionChoiceCreateDto,
    ): Promise<QuestionChoiceResponseDto> {
        const { questionId, optionText, isCorrect } = createQuestionChoiceDto;

        const [result] = await this.pgService.query<QuestionChoiceResponseDto>(
            this.pgService.getSql(__dirname, 'question-choice.create.sql'),
            [questionId, optionText, isCorrect],
        );
        return result;
    }

    async update(
        id: string,
        updateQuestionChoiceDto: QuestionChoiceUpdateDto,
    ): Promise<QuestionChoiceResponseDto> {
        const { questionId, optionText, isCorrect } = updateQuestionChoiceDto;

        const [result] = await this.pgService.query<QuestionChoiceResponseDto>(
            this.pgService.getSql(__dirname, 'question-choice.update.sql'),
            [id, questionId ?? null, optionText ?? null, isCorrect ?? null],
        );
        return result;
    }
}
