import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuizQuestionsService } from './quiz-questions.service';
import { QuizQuestionsController } from './quiz-questions.controller';

@Module({
    imports: [AuthModule],
    controllers: [QuizQuestionsController],
    providers: [QuizQuestionsService],
})
export class QuizQuestionsModule { }
