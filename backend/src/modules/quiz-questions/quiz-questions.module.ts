import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizQuestionsController } from './quiz-questions.controller';
import { QuizQuestionsService } from './quiz-questions.service';
import { QuizQuestionRepository } from './repositories/quiz-question.repository';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([QuizQuestion])],
    controllers: [QuizQuestionsController],
    providers: [QuizQuestionsService, QuizQuestionRepository],
    exports: [QuizQuestionsService],
})
export class QuizQuestionsModule {}
