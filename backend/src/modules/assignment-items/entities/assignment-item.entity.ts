export class AssignmentItem {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    assignmentDescription: string;
    contentId: string;
    contentType: string;
    status: 'assigned' | 'completed';
    title: string;
}
