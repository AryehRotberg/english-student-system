import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuizQuestionCreateDto } from './dto/quiz-question.create.dto';
import { QuizQuestionQueryDto } from './dto/quiz-question.query.dto';
import { QuizQuestionUpdateDto } from './dto/quiz-question.update.dto';
import { QuizQuestionsService } from './quiz-questions.service';

@Controller('quiz-questions')
export class QuizQuestionsController {
    constructor(private readonly quizQuestionsService: QuizQuestionsService) {}

    @Get(':quizId/full')
    async getFullQuiz(@Param('quizId', new ParseUUIDPipe()) quizId: string) {
        return await this.quizQuestionsService.getFullQuiz(quizId);
    }

    @Get()
    async findByUserId(@Query() dto: QuizQuestionQueryDto) {
        return await this.quizQuestionsService.findByQuizId(dto);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuizQuestionDto: QuizQuestionCreateDto) {
        return await this.quizQuestionsService.create(createQuizQuestionDto);
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateQuizQuestionDto: QuizQuestionUpdateDto,
    ) {
        return await this.quizQuestionsService.update(
            id,
            updateQuizQuestionDto,
        );
    }
}
