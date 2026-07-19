import type { AxiosInstance } from 'axios';
import type { WritingTaskApiItem } from '../types/api-items/writing-task';
import { httpClientService } from './http-client.service';

class WritingTasksService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll(): Promise<WritingTaskApiItem[]> {
        const response =
            await this.httpClient.get<WritingTaskApiItem[]>('/writing-tasks');
        return Array.isArray(response.data) ? response.data : [];
    }

    public async create(payload: {
        title: string;
        instructions: string;
        minWords: number;
    }) {
        const response = await this.httpClient.post('/writing-tasks', payload);
        return response.data;
    }
}

export const writingTasksService = new WritingTasksService();
