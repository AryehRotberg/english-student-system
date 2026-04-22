export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    teacherId?: string | null;
    teacherName?: string | null;
    teacherEmail?: string | null;
    isApproved: boolean;
    createdAt: Date;
}
