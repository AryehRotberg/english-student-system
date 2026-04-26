import { Controller, Get, Param } from '@nestjs/common';
import { QuizStudyGuidesService } from './quiz-study-guides.service';

@Controller('quiz-study-guides')
export class QuizStudyGuidesController {
    constructor(
        private readonly quizStudyGuidesService: QuizStudyGuidesService,
    ) {}

    @Get(':quizId')
    async findByQuizId(@Param('quizId') quizId: string) {
        return this.quizStudyGuidesService.findByQuizId(quizId);
    }
}
