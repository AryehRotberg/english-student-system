import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { QuestionChoiceCreateDto } from './dto/question-choice.create.dto';
import { QuestionChoiceQueryDto } from './dto/question-choice.query.dto';
import { QuestionChoiceUpdateDto } from './dto/question-choice.update.dto';
import { QuestionChoicesService } from './question-choices.service';

@Controller('question-choices')
export class QuestionChoicesController {
    constructor(
        private readonly questionChoicesService: QuestionChoicesService,
    ) {}

    @Get()
    async findByQuestionId(@Query() dto: QuestionChoiceQueryDto) {
        return await this.questionChoicesService.findByQuestionId(dto);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuestionChoiceDto: QuestionChoiceCreateDto) {
        return await this.questionChoicesService.create(
            createQuestionChoiceDto,
        );
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateQuestionChoiceDto: QuestionChoiceUpdateDto,
    ) {
        return await this.questionChoicesService.update(
            id,
            updateQuestionChoiceDto,
        );
    }
}
