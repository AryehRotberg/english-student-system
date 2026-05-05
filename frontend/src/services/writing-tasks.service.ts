import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';

class WritingTasksService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll() {
        const response = await this.httpClient.get('/writing-tasks');
        return response.data;
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
