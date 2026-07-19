export type AssignmentApiItem = {
    id: string;
    userId: string;
    title: string;
    description: string;
    dueDate: string | null;
    isCompleted: boolean;
    createdAt: string;
};
