import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuizTopicResponseDto } from './dto/quiz-topic.response.dto';

@Injectable()
export class QuizTopicsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByQuizId(quizId: string): Promise<QuizTopicResponseDto[]> {
        return await this.pgService.query<QuizTopicResponseDto>(
            this.pgService.getSql(__dirname, 'quiz-topic.find-by-quiz-id.sql'),
            [quizId],
        );
    }
}
