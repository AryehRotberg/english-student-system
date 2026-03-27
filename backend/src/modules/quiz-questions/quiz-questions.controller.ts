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
import { TeacherGuard } from '../../auth/auth.guard';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { GetQuizQuestionsFilterDto } from './dto/get-quiz-questions-filter.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { QuizQuestionsService } from './quiz-questions.service';

@Controller('quiz-questions')
export class QuizQuestionsController {
    constructor(private readonly quizQuestionsService: QuizQuestionsService) {}

    @Get(':quizId/full')
    async getFullQuiz(@Param('quizId', new ParseUUIDPipe()) quizId: string) {
        return await this.quizQuestionsService.getFullQuiz(quizId);
    }

    @Get()
    async findByUserId(@Query() filter: GetQuizQuestionsFilterDto) {
        return await this.quizQuestionsService.findByQuizId(filter);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuizQuestionDto: CreateQuizQuestionDto) {
        return await this.quizQuestionsService.create(createQuizQuestionDto);
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
    ) {
        return await this.quizQuestionsService.update(
            id,
            updateQuizQuestionDto,
        );
    }
}
