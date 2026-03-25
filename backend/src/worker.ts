import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
    console.log('Worker process started with PID:', process.pid);
    console.log(`Connecting to Redis and initializing worker... ${process.env.REDIS_URL}`);

    const app = await NestFactory.createApplicationContext(WorkerModule);
    app.enableShutdownHooks();

    console.log('Worker process is ready to handle tasks');
}
bootstrap();
