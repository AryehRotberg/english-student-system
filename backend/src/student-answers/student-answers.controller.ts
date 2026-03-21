import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { UpsertStudentAnswerDto } from './dto/upsert-student-answer.dto';
import { StudentAnswersService } from './student-answers.service';

@Controller('student-answers')
export class StudentAnswersController {
    constructor(
        private readonly studentAnswersService: StudentAnswersService,
    ) {}

    @Post()
    async upsert(@Body() upsertStudentAnswerDto: UpsertStudentAnswerDto) {
        return await this.studentAnswersService.upsert(upsertStudentAnswerDto);
    }

    @Get()
    async findAll() {
        return await this.studentAnswersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.studentAnswersService.findOne(id);
    }

    @Delete(':id')
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.studentAnswersService.remove(id);
    }

    @Post('submit-attempt/:attemptId')
    async submitAttempt(
        @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
    ) {
        return await this.studentAnswersService.submitAttempt(attemptId);
    }
}
