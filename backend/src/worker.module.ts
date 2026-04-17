import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from './config/config.module';

import { AiDraftsModule } from './modules/ai-drafts/ai-drafts.module';
import { LlmModule } from './modules/llm/llm.module';
import { QuizGeneratorWorker } from './modules/ai-drafts/workers/ai-draft.generate-quiz.worker';

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

        LlmModule,
        AiDraftsModule,
    ],
    providers: [QuizGeneratorWorker],
})
export class WorkerModule {}
