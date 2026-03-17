import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';
import type { QuestionOptionAdminItem } from '../types/admin-query-items';

class QuestionOptionsService {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = httpClientService.getInstance();
  }

  public async listByQuestion(questionId: string) {
    const response = await this.httpClient.get(`/question-options?questionId=${questionId}`);
    return response.data;
  }

  public async listAdminByQuestion(questionId?: string): Promise<QuestionOptionAdminItem[]> {
    if (!questionId) {
      return [];
    }

    const data = await this.listByQuestion(questionId);
    return Array.isArray(data) ? (data as QuestionOptionAdminItem[]) : [];
  }

  public async create(payload: { questionId: string; optionText: string; isCorrect: boolean }) {
    const response = await this.httpClient.post('/question-options', payload);
    return response.data;
  }

  public async update(id: string, payload: Partial<{ questionId: string; optionText: string; isCorrect: boolean }>) {
    const response = await this.httpClient.patch(`/question-options/${id}`, payload);
    return response.data;
  }
}

export const questionOptionsService = new QuestionOptionsService();
