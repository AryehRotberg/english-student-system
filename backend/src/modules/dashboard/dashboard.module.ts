import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from '../../auth/auth.module';
import { AssignmentItemsModule } from '../assignment-items/assignment-items.module';

@Module({
    imports: [AuthModule, AssignmentItemsModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
