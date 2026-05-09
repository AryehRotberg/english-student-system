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
import { VocabularyCreateDto } from './dto/vocabulary.create.dto';
import { VocabularyUpdateDto } from './dto/vocabulary.update.dto';
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
    async create(@Body() createVocabularyDto: VocabularyCreateDto) {
        return await this.vocabularyService.create(createVocabularyDto);
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateVocabularyDto: VocabularyUpdateDto,
    ) {
        return await this.vocabularyService.update(id, updateVocabularyDto);
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.vocabularyService.remove(id);
    }
}
