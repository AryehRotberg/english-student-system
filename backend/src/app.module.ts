import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import {
    ConfigService,
    ConfigModule as NestConfigModule,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { AiDraftsModule } from './modules/ai-drafts/ai-drafts.module';
import { AssignmentItemsModule } from './modules/assignment-items/assignment-items.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AudioModule } from './modules/audio/audio.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LlmModule } from './modules/llm/llm.module';
import { QuestionAcceptedAnswersModule } from './modules/question-accepted-answers/question-accepted-answers.module';
import { QuestionChoicesModule } from './modules/question-choices/question-choices.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuizAttemptsModule } from './modules/quiz-attempts/quiz-attempts.module';
import { QuizQuestionsModule } from './modules/quiz-questions/quiz-questions.module';
import { QuizStudyGuidesModule } from './modules/quiz-study-guides/quiz-study-guides.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { ReadingsModule } from './modules/readings/readings.module';
import { SendEmailModule } from './modules/send-email/send-email.module';
import { StudentAnswersModule } from './modules/student-answers/student-answers.module';
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
        TypeOrmModule.forRootAsync({
            imports: [NestConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const certPaths = [
                    path.join(process.cwd(), 'certs', 'prod-ca-2021.crt'),
                    path.join(
                        process.cwd(),
                        'dist',
                        'certs',
                        'prod-ca-2021.crt',
                    ),
                    path.join(
                        __dirname,
                        '..',
                        '..',
                        'certs',
                        'prod-ca-2021.crt',
                    ),
                ];
                const validPath = certPaths.find((p) => fs.existsSync(p));
                const caCert = validPath
                    ? fs.readFileSync(validPath, 'utf8')
                    : undefined;

                return {
                    type: 'postgres',
                    host: config.get('POSTGRES_HOST'),
                    port: config.get<number>('POSTGRES_PORT'),
                    username: config.get('POSTGRES_USER'),
                    password: config.get('POSTGRES_PASSWORD'),
                    database: config.get('POSTGRES_DATABASE'),
                    autoLoadEntities: true,
                    synchronize: false,
                    ssl: {
                        rejectUnauthorized: !!caCert,
                        ...(caCert ? { ca: caCert } : {}),
                    },
                };
            },
        }),
        AssignmentsModule,
        AuthModule,
        AssignmentItemsModule,
        QuizzesModule,
        QuestionsModule,
        QuizQuestionsModule,
        QuestionChoicesModule,
        ReadingsModule,
        WritingTasksModule,
        WritingSubmissionsModule,
        UsersModule,
        QuizAttemptsModule,
        StudentAnswersModule,
        QuestionAcceptedAnswersModule,
        VocabularyModule,
        VocabularyTopicsModule,
        VocabularyTopicWordsModule,
        SendEmailModule,
        DashboardModule,
        LlmModule,
        AiDraftsModule,
        AudioModule,
        QuizStudyGuidesModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
