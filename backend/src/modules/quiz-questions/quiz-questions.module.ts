import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { QuizQuestionsController } from './quiz-questions.controller';
import { QuizQuestionsService } from './quiz-questions.service';

@Module({
    imports: [AuthModule],
    controllers: [QuizQuestionsController],
    providers: [QuizQuestionsService],
    exports: [QuizQuestionsService],
})
export class QuizQuestionsModule {}
