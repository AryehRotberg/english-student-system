import { Injectable } from '@nestjs/common';
import { AssignmentItemCreateDto } from './dto/assignment-item.create.dto';
import { AssignmentItemQueryDto } from './dto/assignment-item.query.dto';
import { AssignmentItemResponseDto } from './dto/assignment-item.response.dto';
import { AssignmentItem } from './entities/assignment-item.entity';
import { AssignmentItemRepository } from './repositories/assignment-item.repository';

@Injectable()
export class AssignmentItemsService {
    constructor(private readonly itemRepo: AssignmentItemRepository) {}

    async findByUserId(
        dto: AssignmentItemQueryDto,
    ): Promise<AssignmentItemResponseDto[]> {
        const { userId } = dto;
        return this.itemRepo.findByUserId(userId);
    }

    async findActiveByUserId(
        userId: string,
    ): Promise<AssignmentItemResponseDto[]> {
        return this.itemRepo.findActiveByUserId(userId);
    }

    async create(dto: AssignmentItemCreateDto): Promise<AssignmentItem> {
        const entity = this.itemRepo.create({
            assignmentId: dto.assignmentId,
            contentType: dto.contentType,
            contentId: dto.contentId,
        });
        return this.itemRepo.save(entity);
    }
}
