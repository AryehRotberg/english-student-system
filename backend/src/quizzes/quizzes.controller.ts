import { InjectQueue } from '@nestjs/bullmq';
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { TeacherGuard } from '../auth/auth.guard';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
    constructor(
        private readonly quizzesService: QuizzesService,
        @InjectQueue('generate-quiz') private readonly generateQuizQueue: Queue,
    ) {}

    @Get()
    async findAll() {
        return this.quizzesService.findAll();
    }

    @Get(':id/topics')
    async findTopicsByQuizId(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.quizzesService.findTopicsByQuizId(id);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuizDto: CreateQuizDto) {
        return this.quizzesService.create(createQuizDto);
    }

    @Post('/generate')
    async generateQuiz(@Body() generateQuizDto: GenerateQuizDto) {
        this.generateQuizQueue.add('generate-quiz', generateQuizDto, {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: 100,
            removeOnFail: 100,
        });
        return { message: 'Quiz generation started' };
    }
}
