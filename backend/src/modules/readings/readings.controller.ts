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
import { ReadingCreateDto } from './dto/reading.create.dto';
import { ReadingUpdateDto } from './dto/reading.update.dto';
import { ReadingsService } from './readings.service';

@Controller('readings')
export class ReadingsController {
    constructor(private readonly readingsService: ReadingsService) {}

    @Get()
    async findAll() {
        return await this.readingsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.readingsService.findOne(id);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createReadingDto: ReadingCreateDto) {
        return await this.readingsService.create(createReadingDto);
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateReadingDto: ReadingUpdateDto,
    ) {
        return await this.readingsService.update(id, updateReadingDto);
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.readingsService.remove(id);
    }
}
