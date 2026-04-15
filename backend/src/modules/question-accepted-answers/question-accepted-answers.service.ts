import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuestionAcceptedAnswerResponseDto } from './dto/question-accepted-answer-response.dto';
import { CreateQuestionAcceptedAnswerDto } from './dto/create-question-accepted-answer.dto';
import { UpdateQuestionAcceptedAnswerDto } from './dto/update-question-accepted-answer.dto';
import { QuestionAcceptedAnswer } from './entities/question-accepted-answer.entity';

@Injectable()
export class QuestionAcceptedAnswersService {
    constructor(private readonly pgService: PostgresService) {}

    async create(createQuestionAcceptedAnswerDto: CreateQuestionAcceptedAnswerDto): Promise<QuestionAcceptedAnswerResponseDto> {
        const { questionId, answer, blankIndex } = createQuestionAcceptedAnswerDto;

        const [result] = await this.pgService.query<QuestionAcceptedAnswer>(
            this.pgService.getSql(__dirname, 'create-question-accepted-answer.sql'),
            [questionId, answer, blankIndex],
        );

        return QuestionAcceptedAnswerResponseDto.fromEntity(result);
    }

    async findAll(): Promise<QuestionAcceptedAnswerResponseDto[]> {
        const answers = await this.pgService.query<QuestionAcceptedAnswer>(
            this.pgService.getSql(__dirname, 'get-all-question-accepted-answers.sql'),
        );
        return QuestionAcceptedAnswerResponseDto.fromEntities(answers);
    }

    async findOne(id: string): Promise<QuestionAcceptedAnswerResponseDto> {
        const [answer] = await this.pgService.query<QuestionAcceptedAnswer>(
            this.pgService.getSql(__dirname, 'get-question-accepted-answer-by-id.sql'),
            [id],
        );

        if (!answer) {
            throw new NotFoundException('Answer not found');
        }

        return QuestionAcceptedAnswerResponseDto.fromEntity(answer);
    }

    async update(
        id: string,
        updateQuestionAcceptedAnswerDto: UpdateQuestionAcceptedAnswerDto,
    ): Promise<QuestionAcceptedAnswerResponseDto> {
        const [result] = await this.pgService.query<QuestionAcceptedAnswer>(
            this.pgService.getSql(__dirname, 'update-question-accepted-answer.sql'),
            [
                id,
                updateQuestionAcceptedAnswerDto.questionId ?? null,
                updateQuestionAcceptedAnswerDto.answer ?? null,
                updateQuestionAcceptedAnswerDto.blankIndex ?? null,
            ],
        );

        if (!result) {
            throw new NotFoundException('Answer not found');
        }

        return QuestionAcceptedAnswerResponseDto.fromEntity(result);
    }

    async remove(id: string): Promise<QuestionAcceptedAnswerResponseDto> {
        const [result] = await this.pgService.query<QuestionAcceptedAnswer>(
            this.pgService.getSql(__dirname, 'delete-question-accepted-answer.sql'),
            [id],
        );

        if (!result) {
            throw new NotFoundException('Answer not found');
        }

        return QuestionAcceptedAnswerResponseDto.fromEntity(result);
    }
}
