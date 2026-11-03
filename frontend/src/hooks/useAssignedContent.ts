import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { AssignmentItemContentType } from '../services/assignments.service';
import {
    groupByAssignment,
    isAssignmentComplete,
    parseDueDate,
} from '../utils/assignments';
import { useAssignmentItems, useAssignments } from './queries';

/**
 * Content of one type that is still open in the student's assignments, keyed
 * by content id, with the soonest due date (null when none has one).
 */
export function useAssignedContent(contentType: AssignmentItemContentType) {
    const { user } = useAuth();
    const { data: assignments = [] } = useAssignments(user?.id);
    const { data: items = [] } = useAssignmentItems(user?.id);

    return useMemo(() => {
        const itemsByAssignment = groupByAssignment(items);
        const dueById = new Map<string, Date | null>();

        for (const assignment of assignments) {
            const assignmentItems = itemsByAssignment.get(assignment.id) ?? [];
            if (isAssignmentComplete(assignment, assignmentItems)) continue;

            const due = parseDueDate(assignment.dueDate);
            for (const item of assignmentItems) {
                // The item type omits lessons, but the API returns them.
                if (
                    (item.contentType as AssignmentItemContentType) !==
                        contentType ||
                    item.isCompleted
                ) {
                    continue;
                }

                const known = dueById.get(item.contentId);
                if (
                    !dueById.has(item.contentId) ||
                    (due && (!known || due < known))
                ) {
                    dueById.set(item.contentId, due);
                }
            }
        }

        return dueById;
    }, [assignments, items, contentType]);
}

/** Soonest due first; content with no due date goes last. */
export function byAssignedDue(dueById: Map<string, Date | null>) {
    return (a: { id: string }, b: { id: string }) =>
        (dueById.get(a.id)?.getTime() ?? Infinity) -
        (dueById.get(b.id)?.getTime() ?? Infinity);
}
