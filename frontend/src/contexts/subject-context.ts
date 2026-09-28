import { createContext, useContext } from 'react';
import type { Subject, SubjectLevel } from '../types/subject';

export type CurrentSubjectValue = {
    // Every subject, with its levels.
    subjects: Subject[];
    // What this student studies (all subjects for a teacher). A student with
    // no enrollment yet sees English, as before subjects existed.
    availableSubjects: Subject[];
    currentSubject: Subject | null;
    // The student's level in the current subject, when the teacher set one.
    currentLevel: SubjectLevel | null;
    isEnglish: boolean;
    setCurrentSubjectId: (subjectId: string) => void;
};

export const SubjectContext = createContext<CurrentSubjectValue | undefined>(
    undefined,
);

export function useCurrentSubject(): CurrentSubjectValue {
    const context = useContext(SubjectContext);

    if (context === undefined) {
        throw new Error(
            'useCurrentSubject must be used within a SubjectProvider',
        );
    }

    return context;
}
