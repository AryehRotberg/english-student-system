import { Logger } from '@nestjs/common';

export type TargetLevel =
    | 'Beginner (CEFR A1)'
    | 'Elementary (CEFR A2)'
    | 'Intermediate (CEFR B1)'
    | 'Upper-Intermediate (CEFR B2)'
    | 'Advanced (CEFR C1)'
    | 'Proficient (CEFR C2)';

export function buildQuizPrompt(
    topic: string,
    openEndedCount: number,
    multipleChoiceCount: number,
    targetLevel: TargetLevel = 'Intermediate (CEFR B1)',
    additionalInstructions?: string,
): string {
    Logger.debug(
        `Building quiz prompt with topic="${topic}", openEndedCount=${openEndedCount}, multipleChoiceCount=${multipleChoiceCount}, targetLevel=${targetLevel}`,
    );

    const extra = additionalInstructions?.trim();

    return `
You are an expert English teacher writing a structured quiz.

# CORE PARAMETERS
- Topic: "${topic}"
- Target Audience: ${targetLevel}
- Open-Ended Questions: ${openEndedCount}
- Multiple Choice Questions: ${multipleChoiceCount}

# 1. AUDIENCE CALIBRATION (CRITICAL)
- CALIBRATE sentence structure, thematic complexity, and surrounding vocabulary EXACTLY to the Target Audience.
- For Beginner/Young (e.g., 6th grade, CEFR A1-A2): Use short, direct sentences. Contexts must be concrete and familiar.
- For Advanced (e.g., PhD, CEFR C1-C2): Use sophisticated syntax, abstract concepts, and highly advanced surrounding vocabulary. Contexts must be professional or academic.
- The cognitive load required to deduce the answer must precisely match the Target Audience.

# 2. CONTENT GENERATION RULES
Analyze the Topic and Additional Instructions. Determine if this is a Grammar quiz or a Vocabulary quiz:

IF GRAMMAR (e.g., Tenses, Prepositions):
- Provide the base verb form or root word in parentheses immediately following the blank. Example: "She [BLANK] (drive) to work yesterday."
- Ensure the surrounding sentence contains enough temporal or structural context to deduce the correct grammar.
- STRICT TENSE ISOLATION (CRITICAL): You MUST strictly isolate the target grammar. If the topic is "Future Simple", do NOT test Future Perfect or Future Continuous. To increase the difficulty_score, use more complex surrounding vocabulary and abstract contexts, NEVER mutate the target grammar itself.
- TARGETED BLANKS ONLY (CRITICAL): If the sentence requires a mixed grammar structure (e.g., a First Conditional requiring both Present Simple and Future Simple), ONLY put the [BLANK] on the specific verb that matches the Topic. Pre-fill the other verbs in the sentence. Do NOT test prerequisite grammar.

IF VOCABULARY:
- Do NOT provide parentheses hints, definitions, or root words. Rely ENTIRELY on the sentence's contextual clues.
- BAD: "The [BLANK] (a person who investigates) examined the scene."
- GOOD: "When the local police ran out of leads, they hired a private [BLANK] to secretly follow the suspect."
- If a list of words is provided, test each word exactly once. Do not put two target vocabulary words in a single question. 
- If a part of speech is specified (e.g., "Figure (noun)"), use it strictly in that form.

# 3. OUTPUT MECHANICS & STRICT VALIDATION (FATAL IF FAILED)
Your output is processed by a strict script. You MUST adhere to these structural rules:

GENERAL:
- Blanks: Use the exact string [BLANK]. Do NOT use underscores.

MULTIPLE CHOICE:
- You MUST include EXACTLY ONE [BLANK] in the question string. Zero blanks or two blanks will crash the system.
- You MUST provide exactly 4 options.
- EXACTLY 1 option must be correct.

OPEN-ENDED:
- May contain one or more [BLANK]s. 
- You MUST map answers to blanks using a left-to-right \`blankIndex\` starting at 1.
- EVERY [BLANK] in the sentence MUST have at least one corresponding answer. If there are 3 [BLANK]s, there must be answers for index 1, 2, and 3.
- NEVER provide an answer with a \`blankIndex\` higher than the total number of [BLANK]s in the sentence.
- NO DUPLICATES: NEVER output the exact same text twice for the same \`blankIndex\` (case-insensitive). "Cannot" and "cannot" are duplicates. 
- Answer Variations: Include ALL common valid variations (e.g., "do not see", "don't see") as separate objects sharing the SAME \`blankIndex\`.

# 4. DIFFICULTY SCORING
- Assign a \`difficulty_score\` (1-10) to every question.
- 1 = Effortless for the Target Audience; 10 = Maximum cognitive load for the Target Audience.
- Ensure a progressive spread of difficulty across the quiz.

${
    extra
        ? `
# 5. OVERRIDE INSTRUCTIONS (CRITICAL)
${extra}
- These override instructions take precedence over stylistic preferences but MUST NOT break Section 3 Validation constraints.
`
        : ''
}
    `.trim();
}
