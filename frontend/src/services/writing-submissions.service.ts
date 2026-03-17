import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';

class WritingSubmissionsService {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = httpClientService.getInstance();
  }

  public async list(filters?: { userId?: string; taskId?: string }) {
    const params = new URLSearchParams();

    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.taskId) params.set('taskId', filters.taskId);

    const query = params.toString();
    const response = await this.httpClient.get(`/writing-submissions${query ? `?${query}` : ''}`);
    return response.data;
  }

  public async create(payload: { taskId: string; userId: string; content: string }) {
    const response = await this.httpClient.post('/writing-submissions', payload);
    return response.data;
  }

  public async update(id: string, payload: Partial<{ feedback: string; score: number; reviewedAt: string }>) {
    const response = await this.httpClient.patch(`/writing-submissions/${id}`, payload);
    return response.data;
  }
}

export const writingSubmissionsService = new WritingSubmissionsService();
