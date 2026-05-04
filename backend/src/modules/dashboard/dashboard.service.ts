import { Injectable } from '@nestjs/common';
import { AssignmentItemsService } from '../assignment-items/assignment-items.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { DashboardMapper } from './dashboard.mapper';
import { DashboardRepository } from './repositories/dashboard.repository';

@Injectable()
export class DashboardService {
    constructor(
        private readonly assignmentItemsService: AssignmentItemsService,
        private readonly assignmentsService: AssignmentsService,
        private readonly dashboardRepo: DashboardRepository,
        private readonly mapper: DashboardMapper,
    ) {}

    async getOverview(user: UserResponseDto) {
        const userId = user.id;

        const [
            activeAssignments,
            activeAssignmentItems,
            quizProgressRaw,
            contentProgressRaw,
        ] = await Promise.all([
            this.assignmentsService.findActiveByUserId(userId),
            this.assignmentItemsService.findActiveByUserId(userId),
            this.dashboardRepo.findQuizProgress(userId),
            this.dashboardRepo.findContentProgress(userId),
        ]);

        return {
            studentName: user.name,
            tasks: activeAssignmentItems.map((item) =>
                this.mapper.toTask(item),
            ),
            assignmentTopics: activeAssignmentItems
                .filter((item) => Boolean(item.contentId))
                .map((item) => this.mapper.toAssignmentTopic(item)),
            activities: activeAssignments
                .slice(0, 5)
                .map((a) => this.mapper.toActivity(a)),
            progress: this.mapper.buildProgressMetrics(
                quizProgressRaw,
                contentProgressRaw,
            ),
        };
    }
}
