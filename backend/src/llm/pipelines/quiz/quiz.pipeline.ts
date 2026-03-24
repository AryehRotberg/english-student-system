import { buildQuizPrompt } from './quiz.prompt';
import { QuizSchema } from './quiz.schema';
import { normalizeQuiz } from './quiz.transformer';
import { validateQuestions } from './quiz.validator';

export const quizPipeline = {
    schema: QuizSchema,

    buildPrompt: (input: {
        topic: string;
        openEndedCount: number;
        multipleChoiceCount: number;
    }) => {
        return buildQuizPrompt(
            input.topic,
            input.openEndedCount,
            input.multipleChoiceCount,
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

        mergedQuestions.sort((a, b) => a.difficulty_score - b.difficulty_score);

        return normalizeQuiz({
            title: output.title,
            questions: mergedQuestions,
        });
    },
};
