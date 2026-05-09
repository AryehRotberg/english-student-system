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
import { TextCreateDto } from './dto/text.create.dto';
import { TextUpdateDto } from './dto/text.update.dto';
import { TextsService } from './texts.service';

@Controller('texts')
export class TextsController {
    constructor(private readonly textsService: TextsService) {}

    @Get()
    async findAll() {
        return await this.textsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.textsService.findOne(id);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createTextDto: TextCreateDto) {
        return await this.textsService.create(createTextDto);
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateTextDto: TextUpdateDto,
    ) {
        return await this.textsService.update(id, updateTextDto);
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.textsService.remove(id);
    }
}
