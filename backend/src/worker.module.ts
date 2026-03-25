import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { LlmModule } from './llm/llm.module';
import { QuizzesWorkerModule } from './quizzes/quizzes-worker.module';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
        }),
        BullModule.forRoot({
            connection: {
                url: process.env.REDIS_FULL_URL,
                maxRetriesPerRequest: null,
                tls: {},
            },
        }),

        BullModule.registerQueue({
            name: 'generate-quiz',
        }),

        LlmModule,
        QuizzesWorkerModule,
    ],
})
export class WorkerModule {}
