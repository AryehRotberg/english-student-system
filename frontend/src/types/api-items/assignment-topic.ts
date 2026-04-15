export type AssignmentTopicApiItem = {
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    assignmentDescription: string;
    isCompleted: boolean;
    contentType: 'quiz' | 'text' | 'writing' | 'vocabulary';
    contentId: string;
    title: string;
};
