export function normalizeQuiz(quiz: any) {
    const totalPoints = 100;
    const n = quiz.questions.length;

    if (n > totalPoints) {
        throw new Error(
            `Too many questions (${n}) to guarantee minimum 1 point each`,
        );
    }

    const alpha = 1.5;

    // Step 1 — base allocation (minimum 1 point each)
    const basePoints = new Array(n).fill(1);

    const remainingPoints = totalPoints - n;

    // Step 2 — weights
    const weights = quiz.questions.map((q: any) =>
        Math.pow(q.difficulty_score, alpha),
    );

    const sumWeights = weights.reduce((a, b) => a + b, 0);

    // Step 3 — distribute remaining points
    const raw = weights.map((w) => (w / sumWeights) * remainingPoints);

    const floored = raw.map(Math.floor);

    let remainder = remainingPoints - floored.reduce((a, b) => a + b, 0);

    const fractions = raw.map((r, i) => ({
        index: i,
        frac: r - Math.floor(r),
    }));

    fractions.sort((a, b) => b.frac - a.frac);

    for (let i = 0; i < remainder; i++) {
        floored[fractions[i].index]++;
    }

    // Step 4 — final points
    const finalPoints = basePoints.map((base, i) => base + floored[i]);

    return {
        title: quiz.title,
        description: quiz.description as string | undefined,
        questions: quiz.questions.map((q: any, i: number) => ({
            ...q,
            question: q.question.replaceAll('[BLANK]', '_____'),
            maxPoints: finalPoints[i],
        })),
    };
}
