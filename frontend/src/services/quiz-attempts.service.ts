import type { AxiosInstance } from 'axios';
import type {
    AttemptGrading,
    PendingReviewAttempt,
} from '../types/api-items/attempt-grading';
import type { QuizAttemptApiItem } from '../types/api-items/quiz-attempt';
import { httpClientService } from './http-client.service';

class QuizAttemptsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findByUserIdAndQuizId(
        userId: string,
        quizId: string,
    ): Promise<QuizAttemptApiItem[]> {
        const response = await this.httpClient.get<QuizAttemptApiItem[]>(
            `/quiz-attempts?userId=${userId}&quizId=${quizId}`,
        );
        return response.data;
    }

    public async findByUserId(userId: string): Promise<QuizAttemptApiItem[]> {
        const response = await this.httpClient.get(
            `/quiz-attempts/user/${userId}`,
        );
        return response.data;
    }

    public async create(payload: {
        quizId: string;
        quizTitle: string;
    }): Promise<QuizAttemptApiItem> {
        const response = await this.httpClient.post<QuizAttemptApiItem>(
            '/quiz-attempts',
            payload,
        );
        return response.data;
    }

    public async submitAttempt(attemptId: string): Promise<QuizAttemptApiItem> {
        const response = await this.httpClient.post<QuizAttemptApiItem>(
            `/quiz-attempts/${attemptId}/submit`,
        );
        return response.data;
    }

    public async findPendingReview(): Promise<PendingReviewAttempt[]> {
        const response = await this.httpClient.get<PendingReviewAttempt[]>(
            '/quiz-attempts/pending-review',
        );
        return response.data;
    }

    public async getGrading(attemptId: string): Promise<AttemptGrading> {
        const response = await this.httpClient.get<AttemptGrading>(
            `/quiz-attempts/${attemptId}/grading`,
        );
        return response.data;
    }

    public async finalizeGrading(
        attemptId: string,
        payload: { acceptSuggestions: boolean },
    ): Promise<QuizAttemptApiItem> {
        const response = await this.httpClient.post<QuizAttemptApiItem>(
            `/quiz-attempts/${attemptId}/finalize`,
            payload,
        );
        return response.data;
    }
}

export const quizAttemptsService = new QuizAttemptsService();
