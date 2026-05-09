import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { VocabularyTopicCreateDto } from './dto/vocabulary-topic.create.dto';
import { VocabularyTopicUpdateDto } from './dto/vocabulary-topic.update.dto';
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
    async create(@Body() createVocabularyTopicDto: VocabularyTopicCreateDto) {
        return await this.vocabularyTopicsService.create(
            createVocabularyTopicDto,
        );
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateVocabularyTopicDto: VocabularyTopicUpdateDto,
    ) {
        return await this.vocabularyTopicsService.update(
            id,
            updateVocabularyTopicDto,
        );
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.vocabularyTopicsService.remove(id);
    }
}
