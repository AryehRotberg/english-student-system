import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateQuestionChoiceDto } from './dto/create-question-choice.dto';
import { GetQuestionChoicesFilterDto } from './dto/get-question-choices-filter.dto';
import { QuestionChoiceResponseDto } from './dto/question-choice-response.dto';
import { UpdateQuestionChoiceDto } from './dto/update-question-choice.dto';
import { QuestionChoice } from './entities/question-choice.entity';

@Injectable()
export class QuestionChoicesService {
    constructor(private readonly pgService: PostgresService) {}

    async findByQuestionId(
        filter: GetQuestionChoicesFilterDto,
    ): Promise<QuestionChoiceResponseDto[]> {
        const { questionId } = filter;

        const questionChoices = await this.pgService.query<QuestionChoice>(
            this.pgService.getSql(
                __dirname,
                'get-question-choices-by-question-id.sql',
            ),
            [questionId],
        );

        return QuestionChoiceResponseDto.fromEntities(questionChoices);
    }

    async create(
        createQuestionChoiceDto: CreateQuestionChoiceDto,
    ): Promise<QuestionChoiceResponseDto> {
        const { questionId, optionText, isCorrect } = createQuestionChoiceDto;

        const [result] = await this.pgService.query<QuestionChoice>(
            this.pgService.getSql(__dirname, 'create-question-choice.sql'),
            [questionId, optionText, isCorrect],
        );

        return QuestionChoiceResponseDto.fromEntity(result);
    }

    async update(
        id: string,
        updateQuestionChoiceDto: UpdateQuestionChoiceDto,
    ): Promise<QuestionChoiceResponseDto> {
        const { questionId, optionText, isCorrect } = updateQuestionChoiceDto;

        const [result] = await this.pgService.query<QuestionChoice>(
            this.pgService.getSql(__dirname, 'update-question-choice.sql'),
            [id, questionId ?? null, optionText ?? null, isCorrect ?? null],
        );

        if (!result) {
            throw new NotFoundException('Question choice not found');
        }

        return QuestionChoiceResponseDto.fromEntity(result);
    }
}
