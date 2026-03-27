import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiContentsService } from 'src/modules/ai-contents/ai-contents.service';
import { LlmService } from '../../../modules/llm/llm.service';
import { quizPipeline } from '../../../modules/llm/pipelines/quiz/quiz.pipeline';

@Processor('generate-quiz')
export class QuizGeneratorWorker extends WorkerHost {
    constructor(
        private readonly llmService: LlmService,
        private readonly aiContentsService: AiContentsService,
    ) {
        super();
    }

    async process(job: Job) {
        console.log(`Processing job ${job.id} with data:`, job.data);

        const {
            topic,
            openEndedCount,
            multipleChoiceCount,
            additionalInstructions,
        } = job.data;

        const llmResponse = await this.llmService.runPipeline(quizPipeline, {
            topic,
            openEndedCount,
            multipleChoiceCount,
            additionalInstructions,
        });

        const result = await this.aiContentsService.create({
            content: JSON.stringify(llmResponse),
            contentType: 'quiz',
        });

        return result;
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        console.log(`Job ${job.id} is now active`);
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        console.log(JSON.stringify(job.returnvalue, null, 2));
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        console.error(`Job ${job.id} failed:`, error);
    }
}
