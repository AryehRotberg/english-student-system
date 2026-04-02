export class ValidAnswer {
    questionMaxPoints: number;
    validAnswer: string;
    blankIndex: string;
}

export class GroupedValidAnswer {
    questionMaxPoints: number;
    validAnswers: string[];
    blankIndex: string;
}

export class CorrectOption {
    maxPoints: number | string;
    correctOptionId: string;
}
