import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuizAiDraftCreateDto, QuizCreateDto } from './dto/quiz.create.dto';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) {}

    @Get()
    async findAll() {
        return this.quizzesService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() dto: QuizCreateDto | QuizAiDraftCreateDto) {
        if (dto instanceof QuizCreateDto) {
            return this.quizzesService.create(dto);
        }
        return this.quizzesService.createFromAiDraft(dto);
    }
}
