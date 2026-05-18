import type { AxiosInstance } from 'axios';
import type {
    QuizCategory,
    ProficiencyLevel,
    QuizSummary,
} from '../types/quiz';
import { httpClientService } from './http-client.service';

export type QuizFilters = {
    category?: QuizCategory;
    level?: ProficiencyLevel;
};

class QuizzesService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll(filters: QuizFilters = {}): Promise<QuizSummary[]> {
        const params: Record<string, string> = {};
        if (filters.category) params.category = filters.category;
        if (filters.level) params.level = filters.level;
        const response = await this.httpClient.get<QuizSummary[]>('/quizzes', {
            params,
        });
        return response.data;
    }

    public async create(payload: { title: string; description?: string }) {
        const response = await this.httpClient.post('/quizzes', payload);
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/quizzes/${id}`);
    }
}

export const quizzesService = new QuizzesService();
