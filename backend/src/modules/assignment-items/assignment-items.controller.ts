import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { AssignmentItemsService } from './assignment-items.service';
import { AssignmentItemCreateDto } from './dto/assignment-item.create.dto';
import { AssignmentItemQueryDto } from './dto/assignment-item.query.dto';

@Controller('assignment-items')
export class AssignmentItemsController {
    constructor(
        private readonly assignmentItemsService: AssignmentItemsService,
    ) {}

    @Get()
    async findByUserId(@Query() filter: AssignmentItemQueryDto) {
        return this.assignmentItemsService.findByUserId(filter);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createAssignmentItemDto: AssignmentItemCreateDto) {
        return await this.assignmentItemsService.create(
            createAssignmentItemDto,
        );
    }
}
