import { Injectable } from '@nestjs/common';
import { GroupedValidAnswer, ValidAnswer } from './entities/grading-data';

export interface BulkUpsertArrays {
    blankIndices: (number | null)[];
    optionIds: (string | null)[];
    texts: (string | null)[];
    points: number[];
}

@Injectable()
export class StudentAnswersCommon {
    prepareBulkUpsertArrays(
        selectedOptionId: string | undefined,
        textAnswers: string[] | undefined,
        scores: number[],
    ): BulkUpsertArrays {
        const textsList = textAnswers ?? [];

        return {
            blankIndices: selectedOptionId
                ? [null]
                : textsList.map((_, i) => i + 1),
            optionIds: selectedOptionId
                ? [selectedOptionId]
                : textsList.map(() => null),
            texts: selectedOptionId ? [null] : textsList,
            points: selectedOptionId
                ? [scores[0] || 0]
                : textsList.map((_, i) => scores[i] ?? 0),
        };
    }

    normalizeAnswer(answer: string): string {
        return answer
            .trim()
            .toLowerCase()
            .replace(/[’`]/g, "'")
            .replace(/\s+/g, ' ');
    }

    groupResultsByBlankIndex(results: ValidAnswer[]): GroupedValidAnswer[] {
        return Object.values(
            results.reduce(
                (acc, current) => {
                    const key = current.blankIndex;

                    if (!acc[key]) {
                        acc[key] = {
                            questionMaxPoints: current.questionMaxPoints,
                            blankIndex: current.blankIndex,
                            validAnswers: [],
                        };
                    }

                    acc[key].validAnswers.push(current.validAnswer);
                    return acc;
                },
                {} as Record<string, GroupedValidAnswer>,
            ),
        );
    }

    distributePoints(totalPoints: number, parts: number): number[] {
        if (parts <= 0) return [];

        const totalCents = Math.round(totalPoints * 100);
        const baseCents = Math.floor(totalCents / parts);
        let remainderCents = totalCents % parts;

        const distribution: number[] = [];
        for (let i = 0; i < parts; i++) {
            const centsForThisPart = baseCents + (remainderCents > 0 ? 1 : 0);
            distribution.push(centsForThisPart / 100);
            remainderCents--;
        }

        return distribution;
    }
}
