import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';
import { GetQuestionOptionsFilterDto } from './dto/get-question-options-filter.dto';
import { QuestionOptionResponseDto } from './dto/question-option-response.dto';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';
import { QuestionOption } from './entities/question-option.entity';

@Injectable()
export class QuestionOptionsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByQuestionId(
        filter: GetQuestionOptionsFilterDto,
    ): Promise<QuestionOptionResponseDto[]> {
        const { questionId } = filter;

        const questionOptions = await this.pgService.query<QuestionOption>(
            this.pgService.getSql(
                __dirname,
                'get-question-options-by-question-id.sql',
            ),
            [questionId],
        );

        return QuestionOptionResponseDto.fromEntities(questionOptions);
    }

    async create(
        createQuestionOptionDto: CreateQuestionOptionDto,
    ): Promise<QuestionOptionResponseDto> {
        const { questionId, optionText, isCorrect } = createQuestionOptionDto;

        const [result] = await this.pgService.query<QuestionOption>(
            this.pgService.getSql(__dirname, 'create-question-option.sql'),
            [questionId, optionText, isCorrect],
        );

        return QuestionOptionResponseDto.fromEntity(result);
    }

    async update(
        id: string,
        updateQuestionOptionDto: UpdateQuestionOptionDto,
    ): Promise<QuestionOptionResponseDto> {
        const { questionId, optionText, isCorrect } = updateQuestionOptionDto;

        const [result] = await this.pgService.query<QuestionOption>(
            this.pgService.getSql(__dirname, 'update-question-option.sql'),
            [id, questionId ?? null, optionText ?? null, isCorrect ?? null],
        );

        if (!result) {
            throw new NotFoundException('Question option not found');
        }

        return QuestionOptionResponseDto.fromEntity(result);
    }
}
