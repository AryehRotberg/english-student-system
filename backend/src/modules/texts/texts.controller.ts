import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { TextCreateDto } from './dto/text.create.dto';
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
}
