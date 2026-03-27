import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/auth.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GetAssignmentsFilterDto } from './dto/get-assignments-filter.dto';

@Controller('assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) {}

    @Get()
    async findByUserId(@Query() filter: GetAssignmentsFilterDto) {
        return await this.assignmentsService.findByUserId(filter);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createAssignmentDto: CreateAssignmentDto) {
        return await this.assignmentsService.create(createAssignmentDto);
    }
}
