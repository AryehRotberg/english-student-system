import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { WritingSubmissionCreateDto } from './dto/writing-submission.create.dto';
import { WritingSubmissionFilterDto } from './dto/writing-submission.query.dto';
import { WritingSubmissionUpdateDto } from './dto/writing-submission.update.dto';
import { WritingSubmission } from './entities/writing-submission.entity';

@Injectable()
export class WritingSubmissionsService {
    constructor(
        @InjectRepository(WritingSubmission)
        private readonly submissionRepo: Repository<WritingSubmission>,
    ) {}

    findAll(filter: WritingSubmissionFilterDto): Promise<WritingSubmission[]> {
        const where: FindOptionsWhere<WritingSubmission> = {};
        if (filter.userId) where.userId = filter.userId;
        if (filter.taskId) where.taskId = filter.taskId;
        return this.submissionRepo.find({
            where,
            order: { submittedAt: 'DESC' },
        });
    }

    async create(dto: WritingSubmissionCreateDto): Promise<WritingSubmission> {
        const entity = this.submissionRepo.create({
            taskId: dto.taskId,
            userId: dto.userId,
            content: dto.content,
        });
        return this.submissionRepo.save(entity);
    }

    async update(
        id: string,
        dto: WritingSubmissionUpdateDto,
    ): Promise<WritingSubmission> {
        await this.submissionRepo.update(id, {
            ...(dto.feedback !== undefined && { feedback: dto.feedback }),
            ...(dto.score !== undefined && { score: dto.score }),
            reviewedAt: dto.reviewedAt ?? new Date(),
        });
        return this.submissionRepo.findOneBy({ id }) as any;
    }
}
