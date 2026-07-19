import type { AxiosInstance } from 'axios';
import type { AssignmentApiItem } from '../types/api-items/assignment';
import { httpClientService } from './http-client.service';

export type AssignmentItemContentType =
    | 'quiz'
    | 'reading'
    | 'writing'
    | 'vocabulary';

class AssignmentsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findByUserId(userId: string): Promise<AssignmentApiItem[]> {
        const response = await this.httpClient.get<AssignmentApiItem[]>(
            '/assignments',
            { params: { userId } },
        );
        return response.data;
    }

    public async create(payload: {
        userId: string;
        title: string;
        description: string;
        dueDate: string;
        items?: { contentType: AssignmentItemContentType; contentId: string }[];
    }): Promise<AssignmentApiItem> {
        const response = await this.httpClient.post<AssignmentApiItem>(
            '/assignments',
            payload,
        );
        return response.data;
    }

    public async update(
        id: string,
        payload: {
            title?: string;
            description?: string;
            dueDate?: string;
            isCompleted?: boolean;
        },
    ): Promise<AssignmentApiItem> {
        const response = await this.httpClient.patch<AssignmentApiItem>(
            `/assignments/${id}`,
            payload,
        );
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/assignments/${id}`);
    }
}

export const assignmentsService = new AssignmentsService();
