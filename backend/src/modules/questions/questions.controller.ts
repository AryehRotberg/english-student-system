import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuestionCreateDto } from './dto/question.create.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) {}

    @Get()
    async findAll() {
        return await this.questionsService.findAll();
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuestionDto: QuestionCreateDto) {
        return await this.questionsService.create(createQuestionDto);
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.questionsService.remove(id);
    }
}
