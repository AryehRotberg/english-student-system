import * as z from 'zod';

export const MultipleChoiceQuestionSchema = z.object({
    question: z
        .string()
        .min(10)
        .describe(
            'The sentence text. MUST contain EXACTLY ONE literal [BLANK] token. Do NOT use multiple blanks.',
        ),
    options: z
        .array(
            z.object({
                text: z.string(),
                isCorrect: z.boolean(),
            }),
        )
        .describe('Provide exactly 4 options. Only one can be true.'),
    difficulty_score: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe(
            'Rate the difficulty of this question from 1 (easiest) to 10 (hardest).',
        ),
});

export const OpenEndedQuestionSchema = z.object({
    question: z
        .string()
        .min(10)
        .describe(
            'The sentence text. MUST contain ONE OR MORE literal [BLANK] tokens.',
        ),
    answers: z
        .array(
            z.object({
                text: z.string(),
                blankIndex: z.number().int().min(1),
            }),
        )
        .describe(
            'Provide one answer object for each [BLANK] token in the question string.',
        ),
    difficulty_score: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe(
            'Rate the difficulty of this question from 1 (easiest) to 10 (hardest).',
        ),
});

export const QuizSchema = z.object({
    title: z.string(),
    multiple_choice_questions: z.array(MultipleChoiceQuestionSchema),
    open_ended_questions: z.array(OpenEndedQuestionSchema),
});

export type QuizStructure = z.infer<typeof QuizSchema>;
