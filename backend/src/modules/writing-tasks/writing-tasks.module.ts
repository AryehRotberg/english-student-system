import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { WritingTasksController } from './writing-tasks.controller';
import { WritingTasksService } from './writing-tasks.service';

@Module({
    imports: [AuthModule],
    controllers: [WritingTasksController],
    providers: [WritingTasksService],
})
export class WritingTasksModule {}
