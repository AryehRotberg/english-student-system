export type UiLanguage = 'en' | 'he';

export type SubjectSlug = 'english' | 'math' | 'cs' | (string & {});

export type SubjectLevel = {
    id: string;
    subjectId: string;
    code: string;
    name: string;
    sortOrder: number;
};

export type Subject = {
    id: string;
    slug: SubjectSlug;
    nameEn: string;
    nameHe: string;
    sortOrder: number;
    levels: SubjectLevel[];
};

export type StudentSubject = {
    subjectId: string;
    subjectSlug: SubjectSlug;
    levelId: string | null;
    levelCode: string | null;
    levelName: string | null;
};

export type UserPreferences = {
    uiLanguage: UiLanguage;
    subjects: StudentSubject[];
};

export type Topic = {
    id: string;
    subjectId: string;
    parentId: string | null;
    slug: string;
    name: string;
    category: string | null;
    sortOrder: number;
};

// Mirrors the fixed ids seeded by the backend migration (KnownSubjects.cs).
export const ENGLISH_SUBJECT_ID = '00000000-0000-4000-a000-000000000001';
