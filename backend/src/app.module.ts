import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssignmentItemsModule } from './assignment-items/assignment-items.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { QuestionOptionsModule } from './question-options/question-options.module';
import { QuestionsModule } from './questions/questions.module';
import { QuizAttemptsModule } from './quiz-attempts/quiz-attempts.module';
import { QuizQuestionsModule } from './quiz-questions/quiz-questions.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { StudentAnswersModule } from './student-answers/student-answers.module';
import { TextsModule } from './texts/texts.module';
import { UsersModule } from './users/users.module';
import { WritingSubmissionsModule } from './writing-submissions/writing-submissions.module';
import { WritingTasksModule } from './writing-tasks/writing-tasks.module';
import { AnswersModule } from './answers/answers.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { VocabularyTopicsModule } from './vocabulary-topics/vocabulary-topics.module';
import { VocabularyTopicWordsModule } from './vocabulary-topic-words/vocabulary-topic-words.module';
import { SendEmailModule } from './send-email/send-email.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
        }),
        AppConfigModule,
        AssignmentsModule,
        AuthModule,
        AssignmentItemsModule,
        QuizzesModule,
        QuestionsModule,
        QuizQuestionsModule,
        QuestionOptionsModule,
        TextsModule,
        WritingTasksModule,
        WritingSubmissionsModule,
        UsersModule,
        QuizAttemptsModule,
        StudentAnswersModule,
        AnswersModule,
        VocabularyModule,
        VocabularyTopicsModule,
        VocabularyTopicWordsModule,
        SendEmailModule,
        DashboardModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
