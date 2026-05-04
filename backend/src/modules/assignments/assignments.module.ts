import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { Assignment } from './entities/assignment.entity';
import { AssignmentRepository } from './repositories/assignment.repository';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Assignment])],
    controllers: [AssignmentsController],
    providers: [AssignmentsService, AssignmentRepository],
    exports: [AssignmentsService],
})
export class AssignmentsModule {}
