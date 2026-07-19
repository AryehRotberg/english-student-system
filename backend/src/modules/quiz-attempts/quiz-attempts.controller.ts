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
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptsService } from './quiz-attempts.service';

@Controller('quiz-attempts')
export class QuizAttemptsController {
    constructor(private readonly service: QuizAttemptsService) {}

    @Get()
    @UseGuards(AuthGuard)
    async findByUserIdAndQuizId(
        @Query() dto: QuizAttemptQueryDto,
    ): Promise<QuizAttempt[]> {
        return await this.service.findByUserIdAndQuizId(dto);
    }

    @Get('user/:userId')
    @UseGuards(TeacherGuard)
    async findByUserId(
        @Param('userId', new ParseUUIDPipe()) userId: string,
    ): Promise<QuizAttempt[]> {
        return await this.service.findByUserId(userId);
    }

    @Post()
    @UseGuards(AuthGuard)
    async create(
        @Body() dto: QuizAttemptCreateDto,
        @User() user: UserResponseDto,
    ): Promise<QuizAttempt> {
        return await this.service.create(dto, user);
    }

    @Post(':attemptId/submit')
    @UseGuards(AuthGuard)
    async submitAttempt(
        @User() user: UserResponseDto,
        @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
    ): Promise<QuizAttempt> {
        return await this.service.submitAttempt(user, attemptId);
    }
}
