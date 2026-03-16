import { Injectable } from '@nestjs/common';
import { PostgresService } from '../config/postgres.client';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizTopicResponseDto } from './dto/quiz-topic-response.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';
import { Quiz } from './entities/quiz.entity';
import { QuizTopic } from './entities/quiz-topic.entity';
import { createQuizQuery, getAllQuizzesQuery, getQuizTopicsByQuizIdQuery } from './quizzes.queries';

@Injectable()
export class QuizzesService {
    constructor(private readonly postgresService: PostgresService) { }

    async findAll(): Promise<QuizResponseDto[]> {
        const quizzes = await this.postgresService.query<Quiz>(getAllQuizzesQuery);
        return QuizResponseDto.fromEntities(quizzes);
    }

    async findTopicsByQuizId(quizId: string): Promise<QuizTopicResponseDto[]> {
        const topics = await this.postgresService.query<QuizTopic>(
            getQuizTopicsByQuizIdQuery,
            [quizId],
        );

        return QuizTopicResponseDto.fromEntities(topics);
    }

    async create(createQuizDto: CreateQuizDto): Promise<QuizResponseDto> {
        const { title, description } = createQuizDto;

        const result = await this.postgresService.query(
            createQuizQuery,
            [title, description]
        );

        return QuizResponseDto.fromEntity(result[0]);
    }
}
