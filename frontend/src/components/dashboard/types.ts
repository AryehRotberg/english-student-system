import type { AssignmentItemContentType } from '../../services/assignments.service';

/** One assignment item, flattened with what the dashboard shows about it. */
export type DashboardTask = {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    // Null when the teacher gave the item no title; show its type instead.
    title: string | null;
    contentType: AssignmentItemContentType;
    contentId: string;
    isCompleted: boolean;
    isOpenable: boolean;
    dueDate: Date | null;
    isOverdue: boolean;
    // Position within its assignment, 1-based.
    step: number;
    stepCount: number;
    subjectId: string | null;
};
