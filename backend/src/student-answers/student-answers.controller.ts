import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { StudentAnswersService } from './student-answers.service';
import { CreateStudentAnswerDto } from './dto/create-student-answer.dto';
import { UpdateStudentAnswerDto } from './dto/update-student-answer.dto';

@Controller('student-answers')
export class StudentAnswersController {
    constructor(private readonly studentAnswersService: StudentAnswersService) { }

    @Post()
    async create(@Body() createStudentAnswerDto: CreateStudentAnswerDto) {
        return await this.studentAnswersService.create(createStudentAnswerDto);
    }

    @Get()
    async findAll() {
        return await this.studentAnswersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.studentAnswersService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateStudentAnswerDto: UpdateStudentAnswerDto,
    ) {
        return await this.studentAnswersService.update(id, updateStudentAnswerDto);
    }

    @Delete(':id')
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return await this.studentAnswersService.remove(id);
    }
}
