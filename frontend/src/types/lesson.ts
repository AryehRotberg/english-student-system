// A lesson is a study guide: optional Markdown text plus uploaded materials.
export type LessonMaterialKind = 'pdf' | 'html';

export type LessonMaterial = {
    id: string;
    title: string;
    kind: LessonMaterialKind;
    mimeType: string;
    sizeBytes: number;
    sortOrder: number;
    uploadedAt: string;
    // Short-lived signed link; refetch the lesson when it expires.
    url: string | null;
};

export type Lesson = {
    id: string;
    topicId: string;
    topicName: string;
    subjectId: string;
    // Null for guides without their own title; show topicName instead.
    title: string | null;
    explanation: string;
    sortOrder: number;
    materials: LessonMaterial[];
};

export type LessonSummary = {
    id: string;
    topicId: string;
    topicName: string;
    subjectId: string;
    title: string | null;
    sortOrder: number;
    materialCount: number;
};

export type SaveLessonPayload = {
    topicId: string;
    title: string | null;
    explanation: string;
    sortOrder: number;
};

export function lessonTitle(lesson: { title: string | null; topicName: string }) {
    return lesson.title || lesson.topicName;
}
