import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../types/quiz';
import {
    answeredQuestionIds,
    formatDuration,
    possiblePoints,
    remainingTime,
} from './exam';

function question(
    questionId: string,
    questionType: QuizQuestion['questionType'],
): QuizQuestion {
    return {
        id: `qq-${questionId}`,
        questionId,
        prompt: '',
        hints: '',
        questionType,
        options: [],
        maxPoints: 25,
        blankCount: 0,
        questionNumber: 1,
        totalQuestions: 1,
        contentFormat: 'plain',
        hasImage: false,
    };
}

describe('possiblePoints', () => {
    it('sums every question when all count', () => {
        expect(possiblePoints([10, 20, 30], null)).toBe(60);
    });

    it('sums only the N heaviest questions on an "answer N of M" exam', () => {
        expect(possiblePoints([25, 25, 25, 25, 25, 25], 4)).toBe(100);
        expect(possiblePoints([10, 40, 30], 2)).toBe(70);
    });

    it('treats N >= M as "all count"', () => {
        expect(possiblePoints([10, 20], 5)).toBe(30);
    });
});

describe('formatDuration', () => {
    it('formats minutes and seconds', () => {
        expect(formatDuration(65_000)).toBe('01:05');
    });

    it('adds hours for long exams', () => {
        expect(formatDuration(3 * 3600_000 + 30 * 60_000)).toBe('3:30:00');
    });

    it('never goes negative', () => {
        expect(formatDuration(-5000)).toBe('00:00');
    });
});

describe('remainingTime', () => {
    it('counts down from the attempt start', () => {
        const startedAt = '2026-01-01T10:00:00.000Z';
        const now = new Date('2026-01-01T10:30:00.000Z').getTime();

        expect(remainingTime(startedAt, 60, now)).toBe(30 * 60_000);
    });
});

describe('answeredQuestionIds', () => {
    it('counts handwritten questions by uploaded pages and others by saved answers', () => {
        const questions = [
            question('a', 'handwritten'),
            question('b', 'handwritten'),
            question('c', 'multiple_choice'),
        ];

        const answered = answeredQuestionIds(
            questions,
            // A handwritten answer row without pages must not count.
            new Set(['b', 'c']),
            new Set(['a']),
        );

        expect([...answered].sort()).toEqual(['a', 'c']);
    });
});
