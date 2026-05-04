import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TeacherGuard } from '../../auth/guards/auth.guard';
import { AssignmentItemsService } from './assignment-items.service';
import { AssignmentItemCreateDto } from './dto/assignment-item.create.dto';
import { AssignmentItemQueryDto } from './dto/assignment-item.query.dto';
import { AssignmentItemResponseDto } from './dto/assignment-item.response.dto';

@Controller('assignment-items')
export class AssignmentItemsController {
    constructor(private readonly service: AssignmentItemsService) {}

    @Get()
    async findByUserId(
        @Query() dto: AssignmentItemQueryDto,
    ): Promise<AssignmentItemResponseDto[]> {
        return this.service.findByUserId(dto);
    }

    @Post()
    @UseGuards(TeacherGuard)
    async create(@Body() dto: AssignmentItemCreateDto) {
        return this.service.create(dto);
    }
}
