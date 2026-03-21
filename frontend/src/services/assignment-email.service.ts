import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";

class AssignmentEmailService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async sendCompletionEmail(attemptId: string) {
        const response = await this.httpClient.post(
            "/send-email/assignment-completion",
            { attemptId },
        );
        return response.data;
    }
}

export const assignmentEmailService = new AssignmentEmailService();
