import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/auth.guard';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { VocabularyService } from './vocabulary.service';

@Controller('vocabulary')
export class VocabularyController {
    constructor(private readonly vocabularyService: VocabularyService) {}

    @Get()
    async findAll() {
        return await this.vocabularyService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createVocabularyDto: CreateVocabularyDto) {
        return await this.vocabularyService.create(createVocabularyDto);
    }
}
