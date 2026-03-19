import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";
import type { QuizAttemptApiItem } from "../types/api-items/quiz-attempt";

class QuizAttemptsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async listByUserAndQuiz(userId: string, quizId: string) {
        const response = await this.httpClient.get(
            `/quiz-attempts?userId=${userId}&quizId=${quizId}`,
        );
        return response.data;
    }

    public async listByUserAndQuizSorted(
        userId?: string,
        quizId?: string,
    ): Promise<QuizAttemptApiItem[]> {
        if (!userId || !quizId) {
            return [];
        }

        const attempts = (await this.listByUserAndQuiz(
            userId,
            quizId,
        )) as QuizAttemptApiItem[];

        return attempts.sort(
            (a, b) =>
                new Date(b.startedAt).getTime() -
                new Date(a.startedAt).getTime(),
        );
    }

    public async create(payload: {
        quizId: string;
        userId: string;
        points?: number;
        startedAt?: string;
        completedAt?: string;
    }) {
        const response = await this.httpClient.post("/quiz-attempts", payload);
        return response.data;
    }

    public async update(
        id: string,
        payload: Partial<{
            quizId: string;
            userId: string;
            points: number;
            startedAt: string;
            completedAt: string;
        }>,
    ) {
        const response = await this.httpClient.patch(
            `/quiz-attempts/${id}`,
            payload,
        );
        return response.data;
    }
}

export const quizAttemptsService = new QuizAttemptsService();
