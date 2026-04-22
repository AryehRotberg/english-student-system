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
import { User } from '../../auth/decorators/user.decorator';
import { AuthGuard, TeacherGuard } from '../../auth/guards/auth.guard';
import { UserResponseDto } from '../users/dto/user.response.dto';
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
    @UseGuards(AuthGuard)
    async create(
        @Body() dto: QuizAttemptCreateDto,
        @User() user: UserResponseDto,
    ) {
        return await this.quizAttemptsService.create(dto, user);
    }

    @Post(':attemptId/submit')
    async submitAttempt(
        @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
    ) {
        return await this.quizAttemptsService.submitAttempt(attemptId);
    }
}
