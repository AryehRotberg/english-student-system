import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { WritingTaskCreateDto } from './dto/writing-task.create.dto';
import { WritingTaskResponseDto } from './dto/writing-task.response.dto';

@Injectable()
export class WritingTasksService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<WritingTaskResponseDto[]> {
        return await this.pgService.query<WritingTaskResponseDto>(
            this.pgService.getSql(__dirname, 'writing-task.find-all.sql'),
        );
    }

    async create(dto: WritingTaskCreateDto): Promise<WritingTaskResponseDto> {
        const { title, instructions, minWords } = dto;

        const [result] = await this.pgService.query<WritingTaskResponseDto>(
            this.pgService.getSql(__dirname, 'writing-task.create.sql'),
            [title, instructions, minWords],
        );
        return result;
    }
}
