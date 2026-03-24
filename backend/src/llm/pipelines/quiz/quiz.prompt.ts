export function buildQuizPrompt(
    topic: string,
    openEndedCount: number,
    multipleChoiceCount: number,
): string {
    console.log(`Building quiz prompt with topic="${topic}", openEndedCount=${openEndedCount}, multipleChoiceCount=${multipleChoiceCount}`);
    return `
        You are an expert English teacher.

        Generate a quiz based on the topic: "${topic}".

        Requirements:
        - Total open-ended questions: ${openEndedCount}
        - Total multiple choice questions: ${multipleChoiceCount}

        Difficulty Rules (CRITICAL):
        - Assign a difficulty_score (1-10) to every question.
        - Ensure a progressive spread of difficulty.
        - Multiple choice questions should generally be the easiest.
        - Open-ended questions should progressively test advanced concepts.

        Rules for Blanks and Verb Hints (CRITICAL):
        - Do NOT use underscores.
        - You MUST use the exact string [BLANK] to represent a missing word.
        - You MUST provide the base form of the target verb in parentheses as a hint (e.g., "(drive)", "(cry)").
        - GOOD Multiple Choice: "The dog [BLANK] (jump) over the fence."
        - GOOD Open Ended: "Where [BLANK] you [BLANK] (drive) when the tire went flat?"
        - GOOD Open Ended: "Why [BLANK] she [BLANK] (cry) during the movie?"

        General Rules:
        - Questions must be grammatically correct and natural
        - Avoid repetition and trivial sentences
        - Ensure variety in sentence structure
        - Do NOT include explanations

        Multiple choice rules:
        - Exactly one [BLANK] per question
        - Provide exactly 4 options
        - Only ONE correct answer

        Open-ended rules:
        - May contain one or more [BLANK]s
        - Each [BLANK] must have a corresponding answer in the answers array
        - Provide answers with correct blankIndex (starting from 1, matching left-to-right order)
    `;
}
