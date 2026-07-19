export type AssignmentItemApiItem = {
    id: string;
    assignmentId: string;
    assignmentTitle: string | null;
    assignmentDescription: string | null;
    assignmentDueDate: string | null;
    contentId: string;
    contentType: 'quiz' | 'reading' | 'writing' | 'vocabulary';
    isCompleted: boolean;
    title: string | null;
};
