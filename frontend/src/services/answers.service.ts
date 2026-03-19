import type { AxiosInstance } from "axios";
import type { AnswerAdminItem } from "../types/admin-query-items";
import { httpClientService } from "./http-client.service";

class AnswersService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async list() {
        const response = await this.httpClient.get("/answers");
        return response.data;
    }

    public async listAdmin(): Promise<AnswerAdminItem[]> {
        const data = await this.list();
        return Array.isArray(data) ? (data as AnswerAdminItem[]) : [];
    }

    public async create(payload: {
        questionId: string;
        answer: string;
        blankIndex: number;
    }) {
        const response = await this.httpClient.post("/answers", payload);
        return response.data;
    }

    public async update(
        id: string,
        payload: Partial<{
            questionId: string;
            answer: string;
            blankIndex: number;
        }>,
    ) {
        const response = await this.httpClient.patch(`/answers/${id}`, payload);
        return response.data;
    }
}

export const answersService = new AnswersService();
