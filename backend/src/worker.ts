import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
    Logger.debug('Worker process started with PID:', process.pid);

    const app = await NestFactory.createApplicationContext(WorkerModule);
    app.enableShutdownHooks();

    Logger.debug('Worker process is ready to handle tasks');
}
bootstrap();
