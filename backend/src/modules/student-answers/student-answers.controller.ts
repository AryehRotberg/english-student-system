import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { StudentAnswerUpsertDto } from './dto/student-answer.upsert.dto';
import { StudentAnswersService } from './student-answers.service';

@Controller('student-answers')
export class StudentAnswersController {
    constructor(
        private readonly studentAnswersService: StudentAnswersService,
    ) {}

    @Post()
    async upsert(@Body() upsertStudentAnswerDto: StudentAnswerUpsertDto) {
        return await this.studentAnswersService.upsert(upsertStudentAnswerDto);
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.studentAnswersService.findOne(id);
    }

    @Get('attempt/:attemptId')
    async findByAttempt(
        @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
    ) {
        return await this.studentAnswersService.findByAttempt(attemptId);
    }

    @Delete(':id')
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.studentAnswersService.remove(id);
    }
}
