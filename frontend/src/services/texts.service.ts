import type { AxiosInstance } from 'axios';
import type { TextAdminItem } from '../types/admin-query-items';
import type { TextApiItem } from '../types/api-items/text';
import type { ReadingItem, ReadingLevel } from '../types/reading';
import { httpClientService } from './http-client.service';

class TextsService {
    private readonly httpClient: AxiosInstance;

    private toReadingLevel(value: string): ReadingLevel {
        if (
            value === 'A2' ||
            value === 'B1' ||
            value === 'B2' ||
            value === 'C1'
        ) {
            return value;
        }

        return 'B1';
    }

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll() {
        const response = await this.httpClient.get('/texts');
        return response.data;
    }

    public async getReadingLibrary(): Promise<ReadingItem[]> {
        const data = (await this.findAll()) as TextApiItem[];

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map((item) => ({
            id: item.id,
            title: item.title,
            level: this.toReadingLevel(item.level),
            minutes: Math.min(
                Math.max(Math.ceil((item.content?.length ?? 800) / 170), 3),
                12,
            ),
            content: item.content ?? '',
        }));
    }

    public async listAdmin(): Promise<TextAdminItem[]> {
        const data = await this.findAll();
        return Array.isArray(data) ? (data as TextAdminItem[]) : [];
    }

    public async findOne(id: string): Promise<{
        id: string;
        title: string;
        content: string;
        level: string;
        quizId: string | null;
        quiz: { id: string; title: string; description: string | null } | null;
        vocabularyTopic: { id: string; topic: string; description: string | null } | null;
    } | null> {
        const response = await this.httpClient.get(`/texts/${id}`);
        return response.data as any;
    }

    public async create(payload: {
        title: string;
        content: string;
        level: string;
    }) {
        const response = await this.httpClient.post('/texts', payload);
        return response.data;
    }
}

export const textsService = new TextsService();
