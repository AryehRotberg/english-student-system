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

            const blanks = (q.question.match(/\[BLANK\]/g) || []).length;

            const grouped = new Map<number, any[]>();

            // Group answers by blankIndex
            for (const answer of q.answers) {
                const index = answer.blankIndex;

                if (index < 1 || index > blanks) {
                    throw new Error(
                        `Invalid blankIndex ${index} in: "${q.question}"`,
                    );
                }

                if (!grouped.has(index)) {
                    grouped.set(index, []);
                }

                grouped.get(index)!.push(answer);
            }

            // Ensure EVERY blank has at least one answer
            for (let i = 1; i <= blanks; i++) {
                if (!grouped.has(i)) {
                    throw new Error(
                        `Missing answers for blankIndex ${i} in: "${q.question}"`,
                    );
                }
            }

            // Prevent duplicates per blank (important)
            for (const [index, group] of grouped.entries()) {
                const seen = new Set<string>();

                for (const a of group) {
                    const normalized = a.text.trim().toLowerCase();

                    if (seen.has(normalized)) {
                        throw new Error(
                            `Duplicate answer "${a.text}" for blankIndex ${index} in: "${q.question}"`,
                        );
                    }

                    seen.add(normalized);
                }
            }
        }
    }
}
