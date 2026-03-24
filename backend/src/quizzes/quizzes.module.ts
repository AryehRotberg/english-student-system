import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { LlmModule } from 'src/llm/llm.module';
import { AuthModule } from '../auth/auth.module';
import { QuizGeneratorWorker } from './quiz-generator.worker';
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
    exports: [BullModule],
    controllers: [QuizzesController],
    providers: [QuizzesService, QuizGeneratorWorker],
})
export class QuizzesModule {}
