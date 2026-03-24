export function validateQuestions(quiz: any): void {
    for (const q of quiz.questions) {
        const blanks = (q.question.match(/\[BLANK\]/g) || []).length;

        if (q.question_type === 'multiple_choice') {
            if (!q.options || q.options.length !== 4) {
                throw new Error('Multiple choice must have exactly 4 options');
            }

            const correctCount = q.options.filter(
                (o: any) => o.isCorrect,
            ).length;

            if (correctCount !== 1) {
                throw new Error(
                    'Multiple choice must have exactly one correct answer',
                );
            }

            if (blanks !== 1) {
                throw new Error(
                    `Multiple choice questions must have exactly one blank. Found ${blanks} in: "${q.question}"`,
                );
            }
        }

        if (q.question_type === 'open_ended') {
            if (!q.answers || q.answers.length === 0) {
                throw new Error('Open-ended questions must have answers');
            }

            if (blanks !== q.answers.length) {
                throw new Error(
                    `Mismatch between blanks (${blanks}) and answers (${q.answers.length}) in: "${q.question}"`,
                );
            }

            const indices = q.answers
                .map((a: any) => a.blankIndex)
                .sort((a: any, b: any) => a - b);

            for (let i = 0; i < indices.length; i++) {
                if (indices[i] !== i + 1) {
                    throw new Error('Invalid blankIndex sequence');
                }
            }
        }
    }
}
