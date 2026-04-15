import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AnswerResponseDto } from './dto/answer-response.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Answer } from './entities/answer.entity';

@Injectable()
export class AnswersService {
    constructor(private readonly pgService: PostgresService) {}

    async create(createAnswerDto: CreateAnswerDto): Promise<AnswerResponseDto> {
        const { questionId, answer, blankIndex } = createAnswerDto;

        const [result] = await this.pgService.query<Answer>(
            this.pgService.getSql(__dirname, 'create-answer.sql'),
            [questionId, answer, blankIndex],
        );

        return AnswerResponseDto.fromEntity(result);
    }

    async findAll(): Promise<AnswerResponseDto[]> {
        const answers = await this.pgService.query<Answer>(
            this.pgService.getSql(__dirname, 'get-all-answers.sql'),
        );
        return AnswerResponseDto.fromEntities(answers);
    }

    async findOne(id: string): Promise<AnswerResponseDto> {
        const [answer] = await this.pgService.query<Answer>(
            this.pgService.getSql(__dirname, 'get-answer-by-id.sql'),
            [id],
        );

        if (!answer) {
            throw new NotFoundException('Answer not found');
        }

        return AnswerResponseDto.fromEntity(answer);
    }

    async update(
        id: string,
        updateAnswerDto: UpdateAnswerDto,
    ): Promise<AnswerResponseDto> {
        const [result] = await this.pgService.query<Answer>(
            this.pgService.getSql(__dirname, 'update-answer.sql'),
            [
                id,
                updateAnswerDto.questionId ?? null,
                updateAnswerDto.answer ?? null,
                updateAnswerDto.blankIndex ?? null,
            ],
        );

        if (!result) {
            throw new NotFoundException('Answer not found');
        }

        return AnswerResponseDto.fromEntity(result);
    }

    async remove(id: string): Promise<AnswerResponseDto> {
        const [result] = await this.pgService.query<Answer>(
            this.pgService.getSql(__dirname, 'delete-answer.sql'),
            [id],
        );

        if (!result) {
            throw new NotFoundException('Answer not found');
        }

        return AnswerResponseDto.fromEntity(result);
    }
}
