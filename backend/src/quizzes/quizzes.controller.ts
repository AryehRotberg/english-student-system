import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../auth/auth.guard';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Get()
    findAll() {
        return this.quizzesService.findAll();
    }

    @Get(':id/topics')
    findTopicsByQuizId(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.quizzesService.findTopicsByQuizId(id);
    }

    @Post()
    @UseGuards(TeacherGuard)
    create(@Body() createQuizDto: CreateQuizDto) {
        return this.quizzesService.create(createQuizDto);
    }
}
