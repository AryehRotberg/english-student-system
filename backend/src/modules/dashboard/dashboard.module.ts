import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AssignmentItemsModule } from '../assignment-items/assignment-items.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { DashboardController } from './dashboard.controller';
import { DashboardMapper } from './dashboard.mapper';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './repositories/dashboard.repository';

@Module({
    imports: [AuthModule, AssignmentItemsModule, AssignmentsModule],
    controllers: [DashboardController],
    providers: [DashboardService, DashboardMapper, DashboardRepository],
})
export class DashboardModule {}
