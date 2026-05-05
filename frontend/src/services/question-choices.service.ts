import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';
import type { QuestionChoiceAdminItem } from '../types/admin-query-items';

class QuestionChoicesService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findByQuestionId(questionId: string) {
        const response = await this.httpClient.get(
            `/question-choices?questionId=${questionId}`,
        );
        return response.data;
    }

    public async findByQuestionIdAdmin(
        questionId?: string,
    ): Promise<QuestionChoiceAdminItem[]> {
        if (!questionId) {
            return [];
        }

        const data = await this.findByQuestionId(questionId);
        return Array.isArray(data) ? (data as QuestionChoiceAdminItem[]) : [];
    }

    public async create(payload: {
        questionId: string;
        optionText: string;
        isCorrect: boolean;
    }) {
        const response = await this.httpClient.post(
            '/question-choices',
            payload,
        );
        return response.data;
    }

    public async update(
        id: string,
        payload: Partial<{
            questionId: string;
            optionText: string;
            isCorrect: boolean;
        }>,
    ) {
        const response = await this.httpClient.patch(
            `/question-choices/${id}`,
            payload,
        );
        return response.data;
    }
}

export const questionChoicesService = new QuestionChoicesService();
