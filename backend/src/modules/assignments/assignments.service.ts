import { Injectable } from '@nestjs/common';
import { AssignmentCreateDto } from './dto/assignment.create.dto';
import { AssignmentQueryDto } from './dto/assignment.query.dto';
import { Assignment } from './entities/assignment.entity';
import { AssignmentRepository } from './repositories/assignment.repository';

@Injectable()
export class AssignmentsService {
    constructor(private readonly assignmentRepo: AssignmentRepository) {}

    findByUserId(dto: AssignmentQueryDto): Promise<Assignment[]> {
        return this.assignmentRepo.find({
            where: { userId: dto.userId },
            order: { createdAt: 'DESC' },
        });
    }

    findActiveByUserId(userId: string): Promise<Assignment[]> {
        return this.assignmentRepo.find({
            where: { userId, isCompleted: false },
            order: { createdAt: 'DESC' },
        });
    }

    async create(dto: AssignmentCreateDto): Promise<Assignment> {
        return this.assignmentRepo.create(dto);
    }
}
