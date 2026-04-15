import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';
import type { QuizSummary, QuizTopic } from '../types/quiz';

class QuizzesService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async list(): Promise<QuizSummary[]> {
        const response = await this.httpClient.get<QuizSummary[]>('/quizzes');
        return response.data;
    }

    public async listTopics(quizId: string): Promise<QuizTopic[]> {
        const response = await this.httpClient.get<QuizTopic[]>(
            `/quizzes/${quizId}/topics`,
        );
        return response.data;
    }

    public async create(payload: { title: string; description?: string }) {
        const response = await this.httpClient.post('/quizzes', payload);
        return response.data;
    }
}

export const quizzesService = new QuizzesService();
