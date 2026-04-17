import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { AssignmentsService } from './assignments.service';
import { AssignmentCreateDto } from './dto/assignment.create.dto';
import { AssignmentQueryDto } from './dto/assignment.query.dto';

@Controller('assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) {}

    @Get()
    async findByUserId(@Query() dto: AssignmentQueryDto) {
        return await this.assignmentsService.findByUserId(dto);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() dto: AssignmentCreateDto) {
        return await this.assignmentsService.create(dto);
    }
}
