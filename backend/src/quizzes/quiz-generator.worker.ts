import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LlmService } from '../llm/llm.service';
import { quizPipeline } from '../llm/pipelines/quiz/quiz.pipeline';

@Processor('generate-quiz')
export class QuizGeneratorWorker extends WorkerHost {
    constructor(private readonly llmService: LlmService) {
        super();
    }

    async process(job: Job) {
        console.log(`Processing job ${job.id} with data:`, job.data);

        const { topic, openEndedCount, multipleChoiceCount } = job.data;

        const result = await this.llmService.runPipeline(quizPipeline, {
            topic,
            openEndedCount,
            multipleChoiceCount,
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
