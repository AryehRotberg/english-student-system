import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { QuestionAcceptedAnswersModule } from '../question-accepted-answers/question-accepted-answers.module';
import { QuestionChoicesModule } from '../question-choices/question-choices.module';
import { QuestionsModule } from '../questions/questions.module';
import { QuizQuestionsModule } from '../quiz-questions/quiz-questions.module';
import { Quiz } from './entities/quiz.entity';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([Quiz]),
        QuestionsModule,
        QuestionChoicesModule,
        QuizQuestionsModule,
        QuestionAcceptedAnswersModule,
    ],
    controllers: [QuizzesController],
    providers: [QuizzesService],
})
export class QuizzesModule {}
