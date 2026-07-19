import type { AxiosInstance } from 'axios';
import type { AssignmentItemApiItem } from '../types/api-items/assignment-item';
import type { AssignmentItemContentType } from './assignments.service';
import { httpClientService } from './http-client.service';

class AssignmentItemsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findByUserId(
        userId: string,
    ): Promise<AssignmentItemApiItem[]> {
        const response = await this.httpClient.get<AssignmentItemApiItem[]>(
            '/assignment-items',
            { params: { userId } },
        );
        return response.data;
    }

    public async create(payload: {
        assignmentId: string;
        contentType: AssignmentItemContentType;
        contentId: string;
    }): Promise<AssignmentItemApiItem> {
        const response = await this.httpClient.post<AssignmentItemApiItem>(
            '/assignment-items',
            payload,
        );
        return response.data;
    }

    public async update(
        id: string,
        payload: {
            contentType?: AssignmentItemContentType;
            contentId?: string;
            isCompleted?: boolean;
        },
    ): Promise<AssignmentItemApiItem> {
        const response = await this.httpClient.patch<AssignmentItemApiItem>(
            `/assignment-items/${id}`,
            payload,
        );
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/assignment-items/${id}`);
    }
}

export const assignmentItemsService = new AssignmentItemsService();
