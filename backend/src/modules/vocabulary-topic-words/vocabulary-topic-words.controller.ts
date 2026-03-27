import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/auth.guard';
import { CreateVocabularyTopicWordDto } from './dto/create-vocabulary-topic-word.dto';
import { GetVocabularyTopicWordsFilterDto } from './dto/get-vocabulary-topic-words-filter.dto';
import { VocabularyTopicWordsService } from './vocabulary-topic-words.service';

@Controller('vocabulary-topic-words')
export class VocabularyTopicWordsController {
    constructor(
        private readonly vocabularyTopicWordsService: VocabularyTopicWordsService,
    ) {}

    @Get()
    async findByTopicId(@Query() filter: GetVocabularyTopicWordsFilterDto) {
        return await this.vocabularyTopicWordsService.findByTopicId(filter);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(
        @Body() createVocabularyTopicWordDto: CreateVocabularyTopicWordDto,
    ) {
        return await this.vocabularyTopicWordsService.create(
            createVocabularyTopicWordDto,
        );
    }
}
