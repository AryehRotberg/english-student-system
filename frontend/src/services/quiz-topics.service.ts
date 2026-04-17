import type { AxiosInstance } from 'axios';
import type { QuizTopic } from '../types/quiz';
import { httpClientService } from './http-client.service';

class QuizTopicsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async list(quizId: string): Promise<QuizTopic[]> {
        const response = await this.httpClient.get<QuizTopic[]>(
            `/quiz-topics/${quizId}`,
        );
        return response.data;
    }
}

export const quizTopicsService = new QuizTopicsService();
