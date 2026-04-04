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
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';
import { GetQuestionOptionsFilterDto } from './dto/get-question-options-filter.dto';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';
import { QuestionOptionsService } from './question-options.service';

@Controller('question-options')
export class QuestionOptionsController {
    constructor(
        private readonly questionOptionsService: QuestionOptionsService,
    ) {}

    @Get()
    async findByQuestionId(@Query() filter: GetQuestionOptionsFilterDto) {
        return await this.questionOptionsService.findByQuestionId(filter);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuestionOptionDto: CreateQuestionOptionDto) {
        return await this.questionOptionsService.create(
            createQuestionOptionDto,
        );
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateQuestionOptionDto: UpdateQuestionOptionDto,
    ) {
        return await this.questionOptionsService.update(
            id,
            updateQuestionOptionDto,
        );
    }
}
