import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';
import type { TextApiItem } from '../types/api-items/text';
import type { TextAdminItem } from '../types/admin-query-items';
import type { ReadingItem, ReadingLevel } from '../types/reading';

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
        }));
    }

    public async listAdmin(): Promise<TextAdminItem[]> {
        const data = await this.findAll();
        return Array.isArray(data) ? (data as TextAdminItem[]) : [];
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
