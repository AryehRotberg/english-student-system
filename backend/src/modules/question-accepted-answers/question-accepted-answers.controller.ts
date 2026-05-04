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
import { QuestionAcceptedAnswerCreateDto } from './dto/question-accepted-answer.create.dto';
import { QuestionAcceptedAnswerUpdateDto } from './dto/question-accepted-answer.update.dto';
import { QuestionAcceptedAnswersService } from './question-accepted-answers.service';

@Controller('question-accepted-answers')
export class QuestionAcceptedAnswersController {
    constructor(private readonly service: QuestionAcceptedAnswersService) {}

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() dto: QuestionAcceptedAnswerCreateDto) {
        return await this.service.create(dto);
    }

    @Get()
    async findAll() {
        return await this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.service.findOne(id);
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: QuestionAcceptedAnswerUpdateDto,
    ) {
        return await this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.service.remove(id);
    }
}
