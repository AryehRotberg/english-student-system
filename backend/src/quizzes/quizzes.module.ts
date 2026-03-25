import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LlmModule } from '../llm/llm.module';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
    imports: [
        LlmModule,
        AuthModule,
        BullModule.registerQueue({
            name: 'generate-quiz',
        }),
    ],
    controllers: [QuizzesController],
    providers: [QuizzesService],
})
export class QuizzesModule {}
