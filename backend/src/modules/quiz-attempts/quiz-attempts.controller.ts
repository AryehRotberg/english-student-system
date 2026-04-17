import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuizAttemptCreateDto } from './dto/quiz-attempt.create.dto';
import { QuizAttemptQueryDto } from './dto/quiz-attempt.query.dto';
import { QuizAttemptsService } from './quiz-attempts.service';

@Controller('quiz-attempts')
export class QuizAttemptsController {
    constructor(private readonly quizAttemptsService: QuizAttemptsService) {}

    @Get()
    async findByUserIdAndQuizId(@Query() dto: QuizAttemptQueryDto) {
        return this.quizAttemptsService.findByUserIdAndQuizId(dto);
    }

    @Get('student/:studentId')
    @UseGuards(TeacherGuard)
    async findByStudentId(
        @Param('studentId', new ParseUUIDPipe()) studentId: string,
    ) {
        return await this.quizAttemptsService.findByUserId(studentId);
    }

    @Post()
    async create(@Body() createQuizAttemptDto: QuizAttemptCreateDto) {
        return await this.quizAttemptsService.create(createQuizAttemptDto);
    }

    @Post(':attemptId/submit')
    async submitAttempt(
        @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
    ) {
        return await this.quizAttemptsService.submitAttempt(attemptId);
    }
}
