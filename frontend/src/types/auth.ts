export type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    teacherName?: string | null;
    teacherEmail?: string | null;
    isApproved?: boolean;
    createdAt: string;
    /** Billing (students only): school grade 1-12, the paying client in Morning, and
     * where receipts are emailed (null = never). */
    grade?: number | null;
    /** Overrides the grade price when set (e.g. an adult student). */
    customLessonPrice?: number | null;
    morningClientId?: string | null;
    morningClientName?: string | null;
    receiptEmail?: string | null;
    /** Default lesson price in ILS: the custom price, else the grade price. */
    suggestedLessonPrice?: number | null;
};
