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
import { WritingSubmissionCreateDto } from './dto/writing-submission.create.dto';
import { WritingSubmissionFilterDto } from './dto/writing-submission.query.dto';
import { WritingSubmissionUpdateDto } from './dto/writing-submission.update.dto';
import { WritingSubmissionsService } from './writing-submissions.service';

@Controller('writing-submissions')
export class WritingSubmissionsController {
    constructor(
        private readonly writingSubmissionsService: WritingSubmissionsService,
    ) {}

    @Get()
    async findAll(@Query() filter: WritingSubmissionFilterDto) {
        return await this.writingSubmissionsService.findAll(filter);
    }

    @Post()
    async create(
        @Body() createWritingSubmissionDto: WritingSubmissionCreateDto,
    ) {
        return await this.writingSubmissionsService.create(
            createWritingSubmissionDto,
        );
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateWritingSubmissionDto: WritingSubmissionUpdateDto,
    ) {
        return await this.writingSubmissionsService.update(
            id,
            updateWritingSubmissionDto,
        );
    }
}
