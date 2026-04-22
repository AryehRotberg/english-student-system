export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    teacherName?: string | null;
    teacherEmail?: string | null;
    isApproved?: boolean;
    createdAt: string;
};
