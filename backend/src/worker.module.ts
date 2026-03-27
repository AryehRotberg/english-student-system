import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule as AppConfigModule } from './config/config.module';

import { LlmModule } from './modules/llm/llm.module';
import { WorkersModule } from './workers/workers.module';

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

        BullModule.registerQueue({
            name: 'generate-quiz',
        }),
        BullModule.registerQueue({
            name: 'publish-quiz',
        }),

        LlmModule,
        WorkersModule,
    ],
})
export class WorkerModule {}
