import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { AiContentsModule } from './modules/ai-contents/ai-contents.module';
import { AnswersModule } from './modules/answers/answers.module';
import { AssignmentItemsModule } from './modules/assignment-items/assignment-items.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AudioModule } from './modules/audio/audio.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LlmModule } from './modules/llm/llm.module';
import { QuestionOptionsModule } from './modules/question-options/question-options.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuizAttemptsModule } from './modules/quiz-attempts/quiz-attempts.module';
import { QuizQuestionsModule } from './modules/quiz-questions/quiz-questions.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { SendEmailModule } from './modules/send-email/send-email.module';
import { StudentAnswersModule } from './modules/student-answers/student-answers.module';
import { TextsModule } from './modules/texts/texts.module';
import { UsersModule } from './modules/users/users.module';
import { VocabularyTopicWordsModule } from './modules/vocabulary-topic-words/vocabulary-topic-words.module';
import { VocabularyTopicsModule } from './modules/vocabulary-topics/vocabulary-topics.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { WritingSubmissionsModule } from './modules/writing-submissions/writing-submissions.module';
import { WritingTasksModule } from './modules/writing-tasks/writing-tasks.module';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
        }),
        AppConfigModule,
        BullModule.forRoot({
            connection: {
                url: process.env.REDIS_FULL_URL,
                maxRetriesPerRequest: null,
                tls: {},
            },
        }),
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
        LlmModule,
        AiContentsModule,
        AudioModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
