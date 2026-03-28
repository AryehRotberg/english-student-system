import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from '../../auth/auth.module';
import { AssignmentItemsModule } from '../assignment-items/assignment-items.module';
import { AssignmentsModule } from '../assignments/assignments.module';

@Module({
    imports: [AuthModule, AssignmentItemsModule, AssignmentsModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
