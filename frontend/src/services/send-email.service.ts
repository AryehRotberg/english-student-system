import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";

class SendEmailService {
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

    public async sendCustomEmail(content: {
        name: string;
        email: string;
        subject: string;
        title: string;
        body: string;
    }) {
        const response = await this.httpClient.post("/send-email", {
            name: content.name,
            email: content.email,
            subject: content.subject,
            title: content.title,
            body: content.body,
        });
        return response.data;
    }
}

export const sendEmailService = new SendEmailService();
