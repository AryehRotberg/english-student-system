import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthUser, useMyPreferences, useSubjects } from '../hooks/queries';
import { ENGLISH_SUBJECT_ID } from '../types/subject';
import { SubjectContext, type CurrentSubjectValue } from './subject-context';

const STORAGE_KEY = 'current-subject';

function readStoredSubjectId(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function SubjectProvider({ children }: { children: ReactNode }) {
    const { i18n } = useTranslation();
    const { data: user } = useAuthUser();
    const isSignedIn = Boolean(user);
    const isTeacher = user?.role === 'teacher';

    const { data: subjects = [] } = useSubjects(isSignedIn);
    const { data: preferences } = useMyPreferences(isSignedIn);
    const [selectedId, setSelectedId] = useState<string | null>(
        readStoredSubjectId,
    );

    // The saved preference follows the user across devices; it wins over the
    // browser-local choice once it has loaded.
    useEffect(() => {
        if (preferences && preferences.uiLanguage !== i18n.language) {
            void i18n.changeLanguage(preferences.uiLanguage);
        }
    }, [preferences, i18n]);

    const value = useMemo<CurrentSubjectValue>(() => {
        const enrolledIds = new Set(
            (preferences?.subjects ?? []).map((s) => s.subjectId),
        );

        const availableSubjects = isTeacher
            ? subjects
            : enrolledIds.size > 0
              ? subjects.filter((s) => enrolledIds.has(s.id))
              : subjects.filter((s) => s.id === ENGLISH_SUBJECT_ID);

        const currentSubject =
            availableSubjects.find((s) => s.id === selectedId) ??
            availableSubjects[0] ??
            null;

        const enrollment = preferences?.subjects.find(
            (s) => s.subjectId === currentSubject?.id,
        );
        const currentLevel =
            currentSubject?.levels.find((l) => l.id === enrollment?.levelId) ??
            null;

        return {
            subjects,
            availableSubjects,
            currentSubject,
            currentLevel,
            isEnglish:
                !currentSubject || currentSubject.id === ENGLISH_SUBJECT_ID,
            setCurrentSubjectId: (subjectId: string) => {
                setSelectedId(subjectId);
                try {
                    localStorage.setItem(STORAGE_KEY, subjectId);
                } catch {
                    // Not persisted in private mode; the choice still applies.
                }
            },
        };
    }, [subjects, preferences, isTeacher, selectedId]);

    return (
        <SubjectContext.Provider value={value}>
            {children}
        </SubjectContext.Provider>
    );
}
