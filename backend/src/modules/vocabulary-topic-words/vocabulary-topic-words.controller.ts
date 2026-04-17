import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { VocabularyTopicWordCreateDto } from './dto/vocabulary-topic-word.create.dto';
import { VocabularyTopicWordQueryDto } from './dto/vocabulary-topic-word.query.dto';
import { VocabularyTopicWordsService } from './vocabulary-topic-words.service';

@Controller('vocabulary-topic-words')
export class VocabularyTopicWordsController {
    constructor(
        private readonly vocabularyTopicWordsService: VocabularyTopicWordsService,
    ) {}

    @Get()
    async findByTopicId(@Query() dto: VocabularyTopicWordQueryDto) {
        return await this.vocabularyTopicWordsService.findByTopicId(dto);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(
        @Body() createVocabularyTopicWordDto: VocabularyTopicWordCreateDto,
    ) {
        return await this.vocabularyTopicWordsService.create(
            createVocabularyTopicWordDto,
        );
    }
}
