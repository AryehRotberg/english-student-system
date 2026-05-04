import { Injectable } from '@nestjs/common';
import { GroupedValidAnswer, ValidAnswer } from './entities/grading-data';

@Injectable()
export class StudentAnswersCommon {
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
