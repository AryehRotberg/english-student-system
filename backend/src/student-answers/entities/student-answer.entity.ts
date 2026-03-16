export class StudentAnswer {
	id: string;
	attemptId: string;
	questionId: string;
	answerData: Record<string, unknown>;
	createdAt: Date;
	points: number | null;
	feedback: string | null;
}
