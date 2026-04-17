import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuestionCreateDto } from './dto/question.create.dto';
import { QuestionResponseDto } from './dto/question.response.dto';

@Injectable()
export class QuestionsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<QuestionResponseDto[]> {
        return await this.pgService.query<QuestionResponseDto>(
            this.pgService.getSql(__dirname, 'question.find-all.sql'),
        );
    }

    async create(
        createQuestionDto: QuestionCreateDto,
    ): Promise<QuestionResponseDto> {
        const { question, questionType } = createQuestionDto;

        const [result] = await this.pgService.query<QuestionResponseDto>(
            this.pgService.getSql(__dirname, 'question.create.sql'),
            [question, questionType],
        );
        return result;
    }
}
