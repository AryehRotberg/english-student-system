import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuizCreateDto } from './dto/quiz.create.dto';
import { QuizResponseDto } from './dto/quiz.response.dto';

@Injectable()
export class QuizzesService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<QuizResponseDto[]> {
        return await this.pgService.query<QuizResponseDto>(
            this.pgService.getSql(__dirname, 'quiz.find-all.sql'),
        );
    }

    async create(createQuizDto: QuizCreateDto): Promise<QuizResponseDto> {
        const { title, description } = createQuizDto;

        const [result] = await this.pgService.query<QuizResponseDto>(
            this.pgService.getSql(__dirname, 'quiz.create.sql'),
            [title, description],
        );
        return result;
    }
}
