import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateWritingTaskDto } from './dto/create-writing-task.dto';
import { WritingTaskResponseDto } from './dto/writing-task-response.dto';
import { WritingTask } from './entities/writing-task.entity';

@Injectable()
export class WritingTasksService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<WritingTaskResponseDto[]> {
        const tasks = await this.pgService.query<WritingTask>(
            this.pgService.getSql(__dirname, 'getAllWritingTasks.sql'),
        );
        return WritingTaskResponseDto.fromEntities(tasks);
    }

    async create(
        createWritingTaskDto: CreateWritingTaskDto,
    ): Promise<WritingTaskResponseDto> {
        const { title, instructions, minWords } = createWritingTaskDto;

        const [result] = await this.pgService.query<WritingTask>(
            this.pgService.getSql(__dirname, 'createWritingTask.sql'),
            [title, instructions, minWords],
        );

        return WritingTaskResponseDto.fromEntity(result);
    }
}
