import type { AssignmentItemApiItem } from '../types/api-items/assignment-item';
import type { AssignmentApiItem } from '../types/api-items/assignment';

export function parseDueDate(dueDate: string | null | undefined) {
    if (!dueDate) {
        return null;
    }

    const parsed = new Date(dueDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

export function isPastDue(dueDate: Date | null) {
    return dueDate !== null && dueDate < startOfToday();
}

/**
 * `isCompleted` on the assignment is a flag only a teacher sets. Students
 * complete an assignment by finishing its items, which never flips that flag,
 * so treat "every item done" as complete too.
 */
export function isAssignmentComplete(
    assignment: AssignmentApiItem,
    items: AssignmentItemApiItem[],
): boolean {
    if (assignment.isCompleted) {
        return true;
    }

    return items.length > 0 && items.every((item) => item.isCompleted);
}

export function groupByAssignment(items: AssignmentItemApiItem[]) {
    const grouped = new Map<string, AssignmentItemApiItem[]>();

    for (const item of items) {
        const existing = grouped.get(item.assignmentId);
        if (existing) {
            existing.push(item);
        } else {
            grouped.set(item.assignmentId, [item]);
        }
    }

    return grouped;
}

/** Earliest due date first; assignments without one go last. */
export function byDueDate(a: AssignmentApiItem, b: AssignmentApiItem) {
    const dueA = parseDueDate(a.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
    const dueB = parseDueDate(b.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
    return dueA - dueB;
}
