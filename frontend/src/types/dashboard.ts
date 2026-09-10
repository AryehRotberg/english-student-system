import type { AssignmentSummary } from './assignment';
import type { ProgressItem } from './progress';
import type { DailyTask } from './task';
import type { AssignmentTopic } from './task';

export type DashboardData = {
    studentName: string;
    tasks: DailyTask[];
    assignmentTopics: AssignmentTopic[];
    progress: ProgressItem[];
    activities: AssignmentSummary[];
};
