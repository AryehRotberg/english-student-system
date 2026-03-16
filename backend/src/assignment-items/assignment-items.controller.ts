import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TeacherGuard } from 'src/auth/auth.guard';
import { AssignmentItemsService } from './assignment-items.service';
import { CreateAssignmentItemDto } from './dto/create-assignment-item.dto';
import { GetAssignmentItemsFilterDto } from './dto/get-asssignment-items-filter.dto';

@Controller('assignment-items')
export class AssignmentItemsController {
    constructor(private readonly assignmentItemsService: AssignmentItemsService) { }

    @Get()
    async findByUserId(@Query() filter: GetAssignmentItemsFilterDto) {
        return this.assignmentItemsService.findByUserId(filter);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() createAssignmentItemDto: CreateAssignmentItemDto) {
        return await this.assignmentItemsService.create(createAssignmentItemDto);
    }
}
