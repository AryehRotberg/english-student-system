import type { AssignmentItemContentType } from '../../services/assignments.service';
import type { QuizCategory } from '../../types/quiz';
import styles from './ContentTile.module.css';

export type Tone = 'accent' | 'blue' | 'teal' | 'amber' | 'violet' | 'rose';

export const contentTypeTone: Record<AssignmentItemContentType, Tone> = {
    quiz: 'amber',
    reading: 'blue',
    vocabulary: 'teal',
    writing: 'violet',
    lesson: 'rose',
};

export const quizCategoryTone: Record<QuizCategory, Tone> = {
    custom: 'amber',
    reading: 'blue',
    grammar: 'violet',
    vocabulary: 'teal',
    listening: 'rose',
};

/** Background/foreground pair for a tone, for pills that match a tile. */
export const toneClass: Record<Tone, string> = {
    accent: styles.accent,
    blue: styles.blue,
    teal: styles.teal,
    amber: styles.amber,
    violet: styles.violet,
    rose: styles.rose,
};
