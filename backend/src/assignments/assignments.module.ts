import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';

@Module({
    imports: [AuthModule],
    controllers: [AssignmentsController],
    providers: [AssignmentsService],
})
export class AssignmentsModule { }
