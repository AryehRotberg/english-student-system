import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { WritingTaskCreateDto } from './dto/writing-task.create.dto';
import { WritingTasksService } from './writing-tasks.service';

@Controller('writing-tasks')
export class WritingTasksController {
    constructor(private readonly writingTasksService: WritingTasksService) {}

    @Get()
    async findAll() {
        return await this.writingTasksService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createWritingTaskDto: WritingTaskCreateDto) {
        return await this.writingTasksService.create(createWritingTaskDto);
    }
}
