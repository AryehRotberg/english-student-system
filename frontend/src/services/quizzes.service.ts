import type { AxiosInstance } from 'axios';
import type {
    GradingMode,
    QuizCategory,
    ProficiencyLevel,
    QuizSummary,
} from '../types/quiz';
import { httpClientService } from './http-client.service';

export type QuizFilters = {
    category?: QuizCategory;
    level?: ProficiencyLevel;
    subjectId?: string;
    levelId?: string;
};

export type SaveQuizPayload = {
    title: string;
    description?: string;
    gradingMode: GradingMode;
    subjectId: string;
    levelId: string | null;
    questionsToAnswer: number | null;
    timeLimitMinutes: number | null;
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
        if (filters.subjectId) params.subjectId = filters.subjectId;
        if (filters.levelId) params.levelId = filters.levelId;
        const response = await this.httpClient.get<QuizSummary[]>('/quizzes', {
            params,
        });
        return response.data;
    }

    public async findOne(id: string): Promise<QuizSummary> {
        const response = await this.httpClient.get<QuizSummary>(
            `/quizzes/${id}`,
        );
        return response.data;
    }

    public async create(payload: SaveQuizPayload): Promise<QuizSummary> {
        const response = await this.httpClient.post('/quizzes', payload);
        return response.data;
    }

    public async update(
        id: string,
        payload: SaveQuizPayload,
    ): Promise<QuizSummary> {
        const response = await this.httpClient.put(`/quizzes/${id}`, payload);
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/quizzes/${id}`);
    }
}

export const quizzesService = new QuizzesService();
