import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { AiDraftsService } from './ai-drafts.service';
import { AiDraftCreateDto } from './dto/ai-draft.create.dto';
import { AiDraftGenerateQuizDto } from './dto/ai-draft.generate-quiz.dto';

@Controller('ai-drafts')
export class AiDraftsController {
    constructor(
        private readonly aiDraftsService: AiDraftsService,

        @InjectQueue('generate-quiz')
        private readonly generateQuizQueue: Queue,
    ) {}

    @Post('/generate-quiz')
    @UseGuards(TeacherGuard)
    async generateQuiz(@Body() generateQuizDto: AiDraftGenerateQuizDto) {
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

    @Get()
    @UseGuards(TeacherGuard)
    async findAll() {
        return this.aiDraftsService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() dto: AiDraftCreateDto) {
        return this.aiDraftsService.create(dto);
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
