import type { AxiosInstance } from 'axios';
import type { QuestionAcceptedAnswerAdminItem } from '../types/admin-query-items';
import { httpClientService } from './http-client.service';

class QuestionAcceptedAnswersService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll() {
        const response = await this.httpClient.get('/question-accepted-answers');
        return response.data;
    }

    public async listAdmin(): Promise<QuestionAcceptedAnswerAdminItem[]> {
        const data = await this.findAll();
        return Array.isArray(data) ? (data as QuestionAcceptedAnswerAdminItem[]) : [];
    }

    public async create(payload: {
        questionId: string;
        answer: string;
        blankIndex: number;
    }) {
        const response = await this.httpClient.post('/question-accepted-answers', payload);
        return response.data;
    }

    public async update(
        id: string,
        payload: Partial<{
            questionId: string;
            answer: string;
            blankIndex: number;
        }>,
    ) {
        const response = await this.httpClient.patch(`/question-accepted-answers/${id}`, payload);
        return response.data;
    }
}

export const questionAcceptedAnswersService = new QuestionAcceptedAnswersService();
