export class Assignment {
    id: string;
    userId: string;
    title: string;
    description: string;
    dueDate: Date;
    status: 'assigned' | 'completed';
    createdAt: Date;
}
