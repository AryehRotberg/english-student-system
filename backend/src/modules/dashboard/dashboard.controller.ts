import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '../../auth/decorators/user.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('/overview')
    @UseGuards(AuthGuard)
    async getOverview(@User() user: UserResponseDto) {
        return await this.dashboardService.getOverview(user);
    }
}
