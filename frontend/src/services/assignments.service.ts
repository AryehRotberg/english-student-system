import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";

class AssignmentsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async listByUser(userId: string) {
        const response = await this.httpClient.get(
            `/assignments?userId=${userId}`,
        );
        return response.data;
    }

    public async create(payload: {
        userId: string;
        title: string;
        description: string;
        dueDate: string;
        status: "assigned" | "completed";
    }) {
        const response = await this.httpClient.post("/assignments", payload);
        return response.data;
    }
}

export const assignmentsService = new AssignmentsService();
