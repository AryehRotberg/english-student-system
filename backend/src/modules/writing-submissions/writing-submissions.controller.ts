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
import { TeacherGuard } from '../../auth/auth.guard';
import { CreateWritingSubmissionDto } from './dto/create-writing-submission.dto';
import { GetWritingSubmissionsFilterDto } from './dto/get-writing-submissions-filter.dto';
import { UpdateWritingSubmissionDto } from './dto/update-writing-submission.dto';
import { WritingSubmissionsService } from './writing-submissions.service';

@Controller('writing-submissions')
export class WritingSubmissionsController {
    constructor(
        private readonly writingSubmissionsService: WritingSubmissionsService,
    ) {}

    @Get()
    async findAll(@Query() filter: GetWritingSubmissionsFilterDto) {
        return await this.writingSubmissionsService.findAll(filter);
    }

    @Post()
    async create(
        @Body() createWritingSubmissionDto: CreateWritingSubmissionDto,
    ) {
        return await this.writingSubmissionsService.create(
            createWritingSubmissionDto,
        );
    }

    @Patch(':id')
    @UseGuards(TeacherGuard)
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateWritingSubmissionDto: UpdateWritingSubmissionDto,
    ) {
        return await this.writingSubmissionsService.update(
            id,
            updateWritingSubmissionDto,
        );
    }
}
