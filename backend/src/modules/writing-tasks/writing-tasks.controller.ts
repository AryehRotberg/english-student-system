import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { CreateWritingTaskDto } from './dto/create-writing-task.dto';
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
    async create(@Body() createWritingTaskDto: CreateWritingTaskDto) {
        return await this.writingTasksService.create(createWritingTaskDto);
    }
}
