export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    teacherName?: string | null;
    teacherEmail?: string | null;
    createdAt: Date;
}
