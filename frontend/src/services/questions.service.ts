import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';
import type { QuestionAdminItem } from '../types/admin-query-items';

class QuestionsService {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = httpClientService.getInstance();
  }

  public async list() {
    const response = await this.httpClient.get('/questions');
    return response.data;
  }

  public async listAdmin(): Promise<QuestionAdminItem[]> {
    const data = await this.list();
    return Array.isArray(data) ? (data as QuestionAdminItem[]) : [];
  }

  public async create(payload: { question: string; questionType: string; audioUrl?: string }) {
    const response = await this.httpClient.post('/questions', payload);
    return response.data;
  }
}

export const questionsService = new QuestionsService();
