import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";

class AssignmentItemsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async listByUser(userId: string) {
        const response = await this.httpClient.get(
            `/assignment-items?userId=${userId}`,
        );
        return response.data;
    }

    public async create(payload: {
        assignmentId: string;
        contentType: "quiz" | "text" | "writing";
        contentId?: string;
    }) {
        const response = await this.httpClient.post(
            "/assignment-items",
            payload,
        );
        return response.data;
    }
}

export const assignmentItemsService = new AssignmentItemsService();
