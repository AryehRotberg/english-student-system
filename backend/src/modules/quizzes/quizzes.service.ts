import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { QuizTopicResponseDto } from './dto/quiz-topic-response.dto';
import { QuizTopic } from './entities/quiz-topic.entity';
import { Quiz } from './entities/quiz.entity';

@Injectable()
export class QuizzesService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<QuizResponseDto[]> {
        const query = this.pgService.getSql(__dirname, 'get-all-quizzes.sql');
        const quizzes = await this.pgService.query<Quiz>(query);
        return QuizResponseDto.fromEntities(quizzes);
    }

    async findTopicsByQuizId(quizId: string): Promise<QuizTopicResponseDto[]> {
        const query = this.pgService.getSql(
            __dirname,
            'get-quiz-topics-by-quiz-id.sql',
        );
        const topics = await this.pgService.query<QuizTopic>(query, [quizId]);

        return QuizTopicResponseDto.fromEntities(topics);
    }

    async create(createQuizDto: CreateQuizDto): Promise<QuizResponseDto> {
        const { title, description } = createQuizDto;

        const query = this.pgService.getSql(__dirname, 'create-quiz.sql');
        const result = await this.pgService.query(query, [title, description]);

        return QuizResponseDto.fromEntity(result[0]);
    }
}
