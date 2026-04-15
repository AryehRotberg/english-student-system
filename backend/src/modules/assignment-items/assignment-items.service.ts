import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { AssignmentItemResponseDto } from './dto/assignment-item-response.dto';
import { CreateAssignmentItemDto } from './dto/create-assignment-item.dto';
import { GetAssignmentItemsFilterDto } from './dto/get-asssignment-items-filter.dto';
import { AssignmentItem } from './entities/assignment-item.entity';

@Injectable()
export class AssignmentItemsService {
    constructor(private readonly pgService: PostgresService) {}

    async findByUserId(
        filter: GetAssignmentItemsFilterDto,
    ): Promise<AssignmentItemResponseDto[]> {
        const { userId } = filter;

        const assignmentItems = await this.pgService.query<AssignmentItem>(
            this.pgService.getSql(
                __dirname,
                'get-assignment-items-by-user-id.sql',
            ),
            [userId],
        );

        return AssignmentItemResponseDto.fromEntities(assignmentItems);
    }

    async create(
        createAssignmentItemDto: CreateAssignmentItemDto,
    ): Promise<AssignmentItemResponseDto> {
        const { assignmentId, contentType, contentId } =
            createAssignmentItemDto;

        const [result] = await this.pgService.query<AssignmentItem>(
            this.pgService.getSql(__dirname, 'create-assignment-item.sql'),
            [assignmentId, contentType, contentId],
        );

        return AssignmentItemResponseDto.fromEntity(result);
    }
}
