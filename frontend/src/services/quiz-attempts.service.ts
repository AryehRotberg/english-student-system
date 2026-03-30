import type { AxiosInstance } from "axios";
import type { QuizAttemptApiItem } from "../types/api-items/quiz-attempt";
import { httpClientService } from "./http-client.service";

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

    public async listByStudentId(
        studentId: string,
    ): Promise<QuizAttemptApiItem[]> {
        const response = await this.httpClient.get(
            `/quiz-attempts/student/${studentId}`,
        );
        return response.data;
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
}

export const quizAttemptsService = new QuizAttemptsService();
