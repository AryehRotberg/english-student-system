import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { WritingTask } from './entities/writing-task.entity';
import { WritingTasksController } from './writing-tasks.controller';
import { WritingTasksService } from './writing-tasks.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([WritingTask])],
    controllers: [WritingTasksController],
    providers: [WritingTasksService],
})
export class WritingTasksModule {}
