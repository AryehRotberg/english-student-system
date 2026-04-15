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
import { CreateQuestionChoiceDto } from './dto/create-question-choice.dto';
import { GetQuestionChoicesFilterDto } from './dto/get-question-choices-filter.dto';
import { UpdateQuestionChoiceDto } from './dto/update-question-choice.dto';
import { QuestionChoicesService } from './question-choices.service';

@Controller('question-choices')
export class QuestionChoicesController {
    constructor(
        private readonly questionChoicesService: QuestionChoicesService,
    ) {}

    @Get()
    async findByQuestionId(@Query() filter: GetQuestionChoicesFilterDto) {
        return await this.questionChoicesService.findByQuestionId(filter);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createQuestionChoiceDto: CreateQuestionChoiceDto) {
        return await this.questionChoicesService.create(
            createQuestionChoiceDto,
        );
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateQuestionChoiceDto: UpdateQuestionChoiceDto,
    ) {
        return await this.questionChoicesService.update(
            id,
            updateQuestionChoiceDto,
        );
    }
}
