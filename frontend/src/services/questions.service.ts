import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';
import type { QuestionAdminItem } from '../types/admin-query-items';
import type { ContentFormat, QuestionType } from '../types/quiz';

export type SaveQuestionPayload = {
    question: string;
    questionType: QuestionType;
    hints?: string | null;
    subjectId?: string;
    levelId?: string | null;
    contentFormat?: ContentFormat;
    source?: string | null;
    topicIds?: string[];
};

class QuestionsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll(subjectId?: string) {
        const response = await this.httpClient.get('/questions', {
            params: subjectId ? { subjectId } : {},
        });
        return response.data;
    }

    public async listAdmin(subjectId?: string): Promise<QuestionAdminItem[]> {
        const data = await this.findAll(subjectId);
        return Array.isArray(data) ? (data as QuestionAdminItem[]) : [];
    }

    public async create(
        payload: SaveQuestionPayload,
    ): Promise<QuestionAdminItem> {
        const response = await this.httpClient.post('/questions', payload);
        return response.data;
    }

    public async update(
        id: string,
        payload: SaveQuestionPayload,
    ): Promise<QuestionAdminItem> {
        const response = await this.httpClient.put(`/questions/${id}`, payload);
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/questions/${id}`);
    }
}

export const questionsService = new QuestionsService();
