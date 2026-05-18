import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuizAiDraftCreateDto, QuizCreateDto } from './dto/quiz.create.dto';
import { QuizQueryDto } from './dto/quiz.query.dto';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) {}

    @Get()
    async findAll(@Query() query: QuizQueryDto) {
        return this.quizzesService.findAll(query.category, query.level);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() dto: QuizCreateDto | QuizAiDraftCreateDto) {
        if (dto instanceof QuizCreateDto) {
            return this.quizzesService.create(dto);
        }
        return this.quizzesService.createFromAiDraft(dto);
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.quizzesService.remove(id);
    }
}
