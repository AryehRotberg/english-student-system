import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { LlmService } from '../../llm/llm.service';
import { AiDraftsService } from '../ai-drafts.service';
import { quizPipeline } from '../pipelines/quiz/quiz.pipeline';

@Processor('generate-quiz')
export class QuizGeneratorWorker extends WorkerHost {
    private readonly logger = new Logger(QuizGeneratorWorker.name);

    constructor(
        private readonly llmService: LlmService,
        private readonly aiDraftsService: AiDraftsService,
    ) {
        super();
    }

    async process(job: Job) {
        this.logger.log(`Processing job ${job.id} with data: ${JSON.stringify(job.data)}`);

        const {
            topic,
            openEndedCount,
            multipleChoiceCount,
            targetLevel,
            additionalInstructions,
        } = job.data;

        const llmResponse = await this.llmService.runPipeline(quizPipeline, {
            topic,
            openEndedCount,
            multipleChoiceCount,
            targetLevel,
            additionalInstructions,
        });

        const result = await this.aiDraftsService.create({
            model: this.llmService.LLM_MODEL,
            draft: JSON.stringify(llmResponse),
            draftType: 'quiz',
            additionalInstructions: additionalInstructions || null,
        });

        return result;
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        this.logger.log(`Job ${job.id} is now active`);
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(JSON.stringify(job.returnvalue, null, 2));
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
    }
}
