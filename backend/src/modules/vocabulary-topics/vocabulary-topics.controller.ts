import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { CreateVocabularyTopicDto } from './dto/create-vocabulary-topic.dto';
import { VocabularyTopicsService } from './vocabulary-topics.service';

@Controller('vocabulary-topics')
export class VocabularyTopicsController {
    constructor(
        private readonly vocabularyTopicsService: VocabularyTopicsService,
    ) {}

    @Get()
    async findAll() {
        return await this.vocabularyTopicsService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createVocabularyTopicDto: CreateVocabularyTopicDto) {
        return await this.vocabularyTopicsService.create(
            createVocabularyTopicDto,
        );
    }
}
