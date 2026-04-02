import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";

export type StudentAnswerApiItem = {
    id: string;
    attemptId: string;
    questionId: string;
    blankIndex: number;
    selectedOptionId: string | null;
    textAnswer: string | null;
    createdAt: string;
    points: number | null;
    feedback: string | null;
};

class StudentAnswersService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async listByAttempt(
        attemptId?: string,
    ): Promise<StudentAnswerApiItem[]> {
        const response = await this.httpClient.get<StudentAnswerApiItem[]>(
            `/student-answers/attempt/${attemptId}`,
        );
        return response.data;
    }

    public async upsert(payload: {
        attemptId: string;
        questionId: string;
        textAnswers?: string[] | null;
        selectedOptionId?: string | null;
        feedback?: string | null;
    }) {
        const response = await this.httpClient.post(
            "/student-answers",
            payload,
        );
        return response.data;
    }
}

export const studentAnswersService = new StudentAnswersService();
