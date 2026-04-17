import { Controller, Get, Param } from '@nestjs/common';
import { QuizTopicsService } from './quiz-topics.service';

@Controller('quiz-topics')
export class QuizTopicsController {
    constructor(private readonly quizTopicsService: QuizTopicsService) {}

    @Get(':quizId')
    async findByQuizId(@Param('quizId') quizId: string) {
        return this.quizTopicsService.findByQuizId(quizId);
    }
}
