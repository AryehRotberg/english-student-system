import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";

export type StudentAnswerApiItem = {
    id: string;
    attemptId: string;
    questionId: string;
    answerData: Record<string, unknown>;
    createdAt: string;
    points: number | null;
    feedback: string | null;
};

class StudentAnswersService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async list(): Promise<StudentAnswerApiItem[]> {
        const response =
            await this.httpClient.get<StudentAnswerApiItem[]>(
                "/student-answers",
            );
        return response.data;
    }

    public async listByAttempt(
        attemptId?: string,
    ): Promise<StudentAnswerApiItem[]> {
        if (!attemptId) {
            return [];
        }

        const answers = await this.list();
        return answers.filter((answer) => answer.attemptId === attemptId);
    }

    public async create(payload: {
        attemptId: string;
        questionId: string;
        answerData: Record<string, unknown>;
        feedback?: string;
    }) {
        const response = await this.httpClient.post(
            "/student-answers",
            payload,
        );
        return response.data;
    }

    public async update(
        id: string,
        payload: Partial<{
            answerData: Record<string, unknown>;
            feedback: string;
            points: number;
        }>,
    ) {
        const response = await this.httpClient.patch(
            `/student-answers/${id}`,
            payload,
        );
        return response.data;
    }
}

export const studentAnswersService = new StudentAnswersService();
