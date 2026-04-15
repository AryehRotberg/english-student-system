import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<QuestionResponseDto[]> {
        const questions = await this.pgService.query<Question>(
            this.pgService.getSql(__dirname, 'get-all-questions.sql'),
        );
        return QuestionResponseDto.fromEntities(questions);
    }

    async create(
        createQuestionDto: CreateQuestionDto,
    ): Promise<QuestionResponseDto> {
        const { question, questionType } = createQuestionDto;

        const [result] = await this.pgService.query<Question>(
            this.pgService.getSql(__dirname, 'create-question.sql'),
            [question, questionType],
        );

        return QuestionResponseDto.fromEntity(result);
    }
}
