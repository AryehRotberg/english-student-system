import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { GetQuizAttemptsFilterDto } from './dto/get-quiz-attempts-filter.dto';
import { UpdateQuizAttemptDto } from './dto/update-quiz-attempt.dto';
import { QuizAttemptsService } from './quiz-attempts.service';

@Controller('quiz-attempts')
export class QuizAttemptsController {
    constructor(private readonly quizAttemptsService: QuizAttemptsService) { }

    @Get()
    async findByUserIdAndQuizId(@Query() filter: GetQuizAttemptsFilterDto) {
        return this.quizAttemptsService.findByUserIdAndQuizId(filter);
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
