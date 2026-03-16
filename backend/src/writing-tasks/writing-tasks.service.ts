import { Injectable } from '@nestjs/common';
import { PostgresService } from 'src/config/postgres.client';
import { CreateWritingTaskDto } from './dto/create-writing-task.dto';
import { WritingTaskResponseDto } from './dto/writing-task-response.dto';
import { WritingTask } from './entities/writing-task.entity';
import { createWritingTaskQuery, getAllWritingTasksQuery } from './writing-tasks.queries';

@Injectable()
export class WritingTasksService {
    constructor(private readonly postgresService: PostgresService) { }

    async findAll(): Promise<WritingTaskResponseDto[]> {
        const tasks = await this.postgresService.query<WritingTask>(getAllWritingTasksQuery);
        return WritingTaskResponseDto.fromEntities(tasks);
    }

    async create(createWritingTaskDto: CreateWritingTaskDto): Promise<WritingTaskResponseDto> {
        const { title, instructions, minWords } = createWritingTaskDto;

        const [result] = await this.postgresService.query<WritingTask>(
            createWritingTaskQuery,
            [title, instructions, minWords],
        );

        return WritingTaskResponseDto.fromEntity(result);
    }
}