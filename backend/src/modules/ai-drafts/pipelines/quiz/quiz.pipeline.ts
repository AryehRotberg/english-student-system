import { buildQuizPrompt, TargetLevel } from './quiz.prompt';
import { QuizSchema } from './quiz.schema';
import { normalizeQuiz } from './quiz.transformer';
import { validateQuestions } from './quiz.validator';

export const quizPipeline = {
    schema: QuizSchema,

    buildPrompt: (input: {
        topic: string;
        openEndedCount: number;
        multipleChoiceCount: number;
        targetLevel?: TargetLevel;
        additionalInstructions?: string;
    }) => {
        return buildQuizPrompt(
            input.topic,
            input.openEndedCount,
            input.multipleChoiceCount,
            input.targetLevel,
            input.additionalInstructions,
        );
    },

    validate: (output: any) => {
        const mergedQuestions = [
            ...output.multiple_choice_questions.map((q: any) => ({
                ...q,
                question_type: 'multiple_choice',
            })),
            ...output.open_ended_questions.map((q: any) => ({
                ...q,
                question_type: 'open_ended',
            })),
        ];

        validateQuestions({
            title: output.title,
            questions: mergedQuestions,
        });
    },

    transform: (output: any) => {
        const sortByDifficulty = (a: any, b: any) =>
            a.difficulty_score - b.difficulty_score;

        const mergedQuestions = [
            ...output.multiple_choice_questions
                .map((q: any) => ({ ...q, question_type: 'multiple_choice' }))
                .sort(sortByDifficulty),
            ...output.open_ended_questions
                .map((q: any) => ({ ...q, question_type: 'open_ended' }))
                .sort(sortByDifficulty),
        ];

        return normalizeQuiz({
            title: output.title,
            questions: mergedQuestions,
        });
    },
};
