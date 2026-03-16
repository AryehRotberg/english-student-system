import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../auth/auth.guard';
import { CreateTextDto } from './dto/create-text.dto';
import { TextsService } from './texts.service';

@Controller('texts')
export class TextsController {
    constructor(private readonly textsService: TextsService) { }

    @Get()
    async findAll() {
        return await this.textsService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createTextDto: CreateTextDto) {
        return await this.textsService.create(createTextDto);
    }
}