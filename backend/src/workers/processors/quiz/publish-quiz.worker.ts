import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('publish-quiz')
export class PublishQuizWorker extends WorkerHost {
    constructor() {
        super();
    }

    async process(job: Job) {
        Logger.debug(`Processing job ${job.id} with data:`, job.data);
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
