import type { AxiosInstance } from 'axios';
import type { QuizAttemptApiItem } from '../types/api-items/quiz-attempt';
import { httpClientService } from './http-client.service';

class QuizAttemptsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async listByUserAndQuiz(
        userId: string,
        quizId: string,
    ): Promise<QuizAttemptApiItem[]> {
        const response = await this.httpClient.get<QuizAttemptApiItem[]>(
            `/quiz-attempts?userId=${userId}&quizId=${quizId}`,
        );
        return response.data;
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
    }): Promise<QuizAttemptApiItem> {
        const response = await this.httpClient.post<QuizAttemptApiItem>(
            '/quiz-attempts',
            payload,
        );
        return response.data;
    }

    public async submitAttempt(attemptId: string) {
        const response = await this.httpClient.post(
            `/quiz-attempts/${attemptId}/submit`,
        );
        return response.data;
    }
}

export const quizAttemptsService = new QuizAttemptsService();
