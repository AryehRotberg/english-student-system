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
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { AiContentsService } from './ai-contents.service';
import { CreateAiContentDto } from './dto/create-ai-content.dto';
import { TeacherGuard } from 'src/auth/auth.guard';

@Controller('ai-contents')
export class AiContentsController {
    constructor(
        private readonly aiContentsService: AiContentsService,

        @InjectQueue('generate-quiz')
        private readonly generateQuizQueue: Queue,

        @InjectQueue('publish-quiz')
        private readonly publishQuizQueue: Queue,
    ) {}

    @Post('/generate-quiz')
    @UseGuards(TeacherGuard)
    async generateQuiz(@Body() generateQuizDto: GenerateQuizDto) {
        const job = await this.generateQuizQueue.add(
            'generate-quiz',
            generateQuizDto,
            this.getJobOptions(),
        );

        return {
            message: 'Quiz generation started',
            jobId: job.id,
        };
    }

    @Post(':id/publish')
    @UseGuards(TeacherGuard)
    async publish(@Param('id', new ParseUUIDPipe()) id: string) {
        const job = await this.publishQuizQueue.add(
            'publish-quiz',
            { id },
            this.getJobOptions(),
        );

        return {
            message: 'Quiz publish started',
            jobId: job.id,
        };
    }

    @Get()
    @UseGuards(TeacherGuard)
    async findAll() {
        return this.aiContentsService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createAiContentDto: CreateAiContentDto) {
        return this.aiContentsService.create(createAiContentDto);
    }

    private getJobOptions() {
        return {
            attempts: 3,
            backoff: 5000,
            removeOnComplete: 100,
            removeOnFail: 100,
        };
    }
}
