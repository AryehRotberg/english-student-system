export type AssignmentApiItem = {
    id: string;
    title: string;
    description: string;
    status: 'assigned' | 'completed';
    createdAt: string;
};