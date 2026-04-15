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
import { QuestionAcceptedAnswersService } from './question-accepted-answers.service';
import { CreateQuestionAcceptedAnswerDto } from './dto/create-question-accepted-answer.dto';
import { UpdateQuestionAcceptedAnswerDto } from './dto/update-question-accepted-answer.dto';

@Controller('question-accepted-answers')
export class QuestionAcceptedAnswersController {
    constructor(private readonly questionAcceptedAnswersService: QuestionAcceptedAnswersService) {}

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuestionAcceptedAnswerDto: CreateQuestionAcceptedAnswerDto) {
        return await this.questionAcceptedAnswersService.create(createQuestionAcceptedAnswerDto);
    }

    @Get()
    async findAll() {
        return await this.questionAcceptedAnswersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.questionAcceptedAnswersService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateQuestionAcceptedAnswerDto: UpdateQuestionAcceptedAnswerDto,
    ) {
        return await this.questionAcceptedAnswersService.update(id, updateQuestionAcceptedAnswerDto);
    }

    @Delete(':id')
    @UseGuards(TeacherGuard)
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.questionAcceptedAnswersService.remove(id);
    }
}
