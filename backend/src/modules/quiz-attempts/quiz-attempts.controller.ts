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
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { GetQuizAttemptsFilterDto } from './dto/get-quiz-attempts-filter.dto';
import { UpdateQuizAttemptDto } from './dto/update-quiz-attempt.dto';
import { QuizAttemptsService } from './quiz-attempts.service';

@Controller('quiz-attempts')
export class QuizAttemptsController {
    constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

    @Get()
    async findByUserIdAndQuizId(@Query() filter: GetQuizAttemptsFilterDto) {
        return this.quizAttemptsService.findByUserIdAndQuizId(filter);
    }

    @Get('student/:studentId')
    @UseGuards(TeacherGuard)
    async findByStudentId(
        @Param('studentId', new ParseUUIDPipe()) studentId: string,
    ) {
        return await this.quizAttemptsService.findByUserId(studentId);
    }

    @Post()
    async create(@Body() createQuizAttemptDto: CreateQuizAttemptDto) {
        return await this.quizAttemptsService.create(createQuizAttemptDto);
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateQuizAttemptDto: UpdateQuizAttemptDto,
    ) {
        return await this.quizAttemptsService.update(id, updateQuizAttemptDto);
    }
}
