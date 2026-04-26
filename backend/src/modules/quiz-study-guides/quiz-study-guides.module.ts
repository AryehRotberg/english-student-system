import { Module } from '@nestjs/common';
import { QuizStudyGuidesController } from './quiz-study-guides.controller';
import { QuizStudyGuidesService } from './quiz-study-guides.service';

@Module({
    controllers: [QuizStudyGuidesController],
    providers: [QuizStudyGuidesService],
})
export class QuizStudyGuidesModule {}
