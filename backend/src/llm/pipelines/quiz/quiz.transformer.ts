export function normalizeQuiz(quiz: any) {
    const totalQuestions = quiz.questions.length;
    const pointsPerQuestion = Math.floor(100 / totalQuestions);

    return {
        title: quiz.title,
        questions: quiz.questions.map((q: any) => ({
            ...q,
            question: q.question.replaceAll('[BLANK]', '_____'),
            maxPoints: pointsPerQuestion,
        })),
    };
}
