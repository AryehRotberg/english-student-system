import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from 'src/config/postgres.client';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerResponseDto } from './dto/answer-response.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from './entities/answer.entity';
import {
    createAnswerQuery,
    deleteAnswerQuery,
    getAllAnswersQuery,
    getAnswerByIdQuery,
    updateAnswerQuery,
} from './answers.queries';

@Injectable()
export class AnswersService {
    constructor(private readonly postgresService: PostgresService) { }

    async create(createAnswerDto: CreateAnswerDto): Promise<AnswerResponseDto> {
        const { questionId, answer, blankIndex } = createAnswerDto;

        const [result] = await this.postgresService.query<Answer>(
            createAnswerQuery,
            [questionId, answer, blankIndex],
        );

        return AnswerResponseDto.fromEntity(result);
    }

    async findAll(): Promise<AnswerResponseDto[]> {
        const answers = await this.postgresService.query<Answer>(getAllAnswersQuery);
        return AnswerResponseDto.fromEntities(answers);
    }

    async findOne(id: string): Promise<AnswerResponseDto> {
        const [answer] = await this.postgresService.query<Answer>(getAnswerByIdQuery, [id]);

        if (!answer) {
            throw new NotFoundException('Answer not found');
        }

        return AnswerResponseDto.fromEntity(answer);
    }

    async update(id: string, updateAnswerDto: UpdateAnswerDto): Promise<AnswerResponseDto> {
        const existingAnswer = await this.findOne(id);

        const [result] = await this.postgresService.query<Answer>(
            updateAnswerQuery,
            [
                id,
                updateAnswerDto.questionId ?? existingAnswer.questionId,
                updateAnswerDto.answer ?? existingAnswer.answer,
                updateAnswerDto.blankIndex ?? existingAnswer.blankIndex,
            ],
        );

        return AnswerResponseDto.fromEntity(result);
    }

    async remove(id: string): Promise<AnswerResponseDto> {
        const [result] = await this.postgresService.query<Answer>(deleteAnswerQuery, [id]);

        if (!result) {
            throw new NotFoundException('Answer not found');
        }

        return AnswerResponseDto.fromEntity(result);
    }
}
