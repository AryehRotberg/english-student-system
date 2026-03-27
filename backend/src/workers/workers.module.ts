import { Module } from '@nestjs/common';
import { AiContentsModule } from 'src/modules/ai-contents/ai-contents.module';
import { LlmModule } from 'src/modules/llm/llm.module';
import { QuizGeneratorWorker } from './processors/quiz/generate-quiz.worker';
import { PublishQuizWorker } from './processors/quiz/publish-quiz.worker';

@Module({
    imports: [LlmModule, AiContentsModule],
    providers: [QuizGeneratorWorker, PublishQuizWorker],
})
export class WorkersModule {}
