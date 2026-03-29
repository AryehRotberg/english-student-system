import { Module } from '@nestjs/common';
import { QuizAttemptsModule } from '../quiz-attempts/quiz-attempts.module';
import { StudentAnswersService } from './student-answers.service';
import { StudentAnswersController } from './student-answers.controller';

@Module({
    imports: [QuizAttemptsModule],
    controllers: [StudentAnswersController],
    providers: [StudentAnswersService],
})
export class StudentAnswersModule {}
