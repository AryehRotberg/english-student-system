import { Module } from '@nestjs/common';
import { LlmModule } from '../llm/llm.module';
import { QuizGeneratorWorker } from './quiz-generator.worker';

@Module({
    imports: [LlmModule],
    providers: [QuizGeneratorWorker],
})
export class QuizzesWorkerModule {}
