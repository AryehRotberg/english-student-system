import type { AxiosInstance } from 'axios';
import type { QuizSummary } from '../types/quiz';
import { httpClientService } from './http-client.service';

class QuizzesService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll(): Promise<QuizSummary[]> {
        const response = await this.httpClient.get<QuizSummary[]>('/quizzes');
        return response.data;
    }

    public async create(payload: { title: string; description?: string }) {
        const response = await this.httpClient.post('/quizzes', payload);
        return response.data;
    }
}

export const quizzesService = new QuizzesService();
