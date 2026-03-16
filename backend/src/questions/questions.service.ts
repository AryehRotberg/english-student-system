import { Injectable } from '@nestjs/common';
import { PostgresService } from '../config/postgres.client';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { Question } from './entities/question.entity';
import { createQuestionQuery, getAllQuestionsQuery } from './questions.queries';

@Injectable()
export class QuestionsService {
    constructor(private readonly postgresService: PostgresService) { }

    async findAll(): Promise<QuestionResponseDto[]> {
        const questions = await this.postgresService.query<Question>(getAllQuestionsQuery);
        return QuestionResponseDto.fromEntities(questions);
    }

    async create(createQuestionDto: CreateQuestionDto): Promise<QuestionResponseDto> {
        const { question, questionType, audioUrl } = createQuestionDto;

        const [result] = await this.postgresService.query<Question>(
            createQuestionQuery,
            [question, questionType, audioUrl ?? null],
        );

        return QuestionResponseDto.fromEntity(result);
    }
}