export class AssignmentItem {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    assignmentDescription: string;
    assignmentDueDate: string | null;
    assignmentCreatedAt: string;
    contentId: string;
    contentType: string;
    status: 'assigned' | 'completed';
    title: string;
}
