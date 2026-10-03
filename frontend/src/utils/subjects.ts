import type { Subject } from '../types/subject';

export function subjectName(
    subject: Pick<Subject, 'nameEn' | 'nameHe'> | null | undefined,
    language: string,
): string {
    if (!subject) {
        return '';
    }

    return language === 'he' ? subject.nameHe : subject.nameEn;
}

export function levelName(
    subject: Subject | null | undefined,
    levelId: string | null | undefined,
): string | null {
    if (!subject || !levelId) {
        return null;
    }

    return subject.levels.find((l) => l.id === levelId)?.name ?? null;
}
