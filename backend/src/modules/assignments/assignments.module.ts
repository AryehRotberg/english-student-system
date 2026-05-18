import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { SendEmailModule } from '../send-email/send-email.module';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { Assignment } from './entities/assignment.entity';
import { AssignmentProgressRepository } from './repositories/assignment-progress.repository';
import { AssignmentRepository } from './repositories/assignment.repository';

@Module({
    imports: [AuthModule, SendEmailModule, TypeOrmModule.forFeature([Assignment])],
    controllers: [AssignmentsController],
    providers: [AssignmentsService, AssignmentRepository, AssignmentProgressRepository],
    exports: [AssignmentsService],
})
export class AssignmentsModule {}
