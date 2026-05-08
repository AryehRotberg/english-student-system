import React, { Fragment } from 'react';
import type { StudentAnswerApiItem } from '../services/student-answers.service';
import type { QuizQuestion } from '../types/quiz';

const BLANK = '_____';

const answerStyle: React.CSSProperties = {
    display: 'inline-block',
    background: '#dbeafe',
    color: '#1e3a8a',
    fontWeight: 600,
    borderRadius: '4px',
    padding: '0 0.35em',
    margin: '0 0.1em',
};

const missingStyle: React.CSSProperties = {
    display: 'inline-block',
    background: '#f1f5f9',
    color: '#94a3b8',
    borderRadius: '4px',
    padding: '0 0.35em',
    margin: '0 0.1em',
    letterSpacing: '0.05em',
};

export function fillPromptBlanks(
    question: QuizQuestion,
    answers: StudentAnswerApiItem[],
): React.ReactNode {
    const parts = question.prompt.split(BLANK);

    const questionAnswers = answers
        .filter((a) => a.questionId === question.questionId)
        .sort((a, b) => a.blankIndex - b.blankIndex);

    const mcAnswer = questionAnswers.find(
        (a) => a.selectedOptionId !== null && a.selectedOptionId !== undefined,
    );

    if (parts.length === 1) {
        if (!mcAnswer) return question.prompt;

        const option = question.options.find(
            (o) => o.id === mcAnswer.selectedOptionId,
        );
        if (!option) return question.prompt;

        return (
            <>
                {question.prompt}{' '}
                <span style={answerStyle}>{option.label}</span>
            </>
        );
    }

    // Fill-in-the-blank prompt
    let answerTexts: (string | null)[];

    if (questionAnswers.length === 0) {
        answerTexts = parts.slice(0, -1).map(() => null);
    } else if (mcAnswer) {
        const option = question.options.find(
            (o) => o.id === mcAnswer.selectedOptionId,
        );
        answerTexts = [option?.label ?? null];
    } else {
        answerTexts = questionAnswers.map((a) => a.textAnswer ?? null);
    }

    return (
        <>
            {parts.map((part, i) => (
                <Fragment key={i}>
                    {part}
                    {i < parts.length - 1 &&
                        (answerTexts[i] != null ? (
                            <span style={answerStyle}>{answerTexts[i]}</span>
                        ) : (
                            <span style={missingStyle}>{BLANK}</span>
                        ))}
                </Fragment>
            ))}
        </>
    );
}
