import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AssignmentItemCreateDto } from './dto/assignment-item.create.dto';
import { AssignmentItemResponseDto } from './dto/assignment-item.response.dto';
import { AssignmentItemQueryDto } from './dto/assignment-item.query.dto';

@Injectable()
export class AssignmentItemsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByUserId(
        filter: AssignmentItemQueryDto,
    ): Promise<AssignmentItemResponseDto[]> {
        const { userId } = filter;

        return await this.pgService.query<AssignmentItemResponseDto>(
            this.pgService.getSql(
                __dirname,
                'assignment-item.find-by-user.sql',
            ),
            [userId],
        );
    }

    async create(
        dto: AssignmentItemCreateDto,
    ): Promise<AssignmentItemResponseDto> {
        const { assignmentId, contentType, contentId } = dto;

        const [result] = await this.pgService.query<AssignmentItemResponseDto>(
            this.pgService.getSql(__dirname, 'assignment-item.create.sql'),
            [assignmentId, contentType, contentId],
        );
        return result;
    }
}
