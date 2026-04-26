import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { QuizStudyGuideResponseDto } from './dto/quiz-study-guide.response.dto';

@Injectable()
export class QuizStudyGuidesService {
    constructor(private readonly pgService: PostgresService) {}

    async findByQuizId(quizId: string): Promise<QuizStudyGuideResponseDto[]> {
        return await this.pgService.query<QuizStudyGuideResponseDto>(
            this.pgService.getSql(
                __dirname,
                'quiz-study-guide.find-by-quiz-id.sql',
            ),
            [quizId],
        );
    }
}
