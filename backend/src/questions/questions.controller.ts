import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../auth/auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) {}

    @Get()
    async findAll() {
        return await this.questionsService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuestionDto: CreateQuestionDto) {
        return await this.questionsService.create(createQuestionDto);
    }
}
