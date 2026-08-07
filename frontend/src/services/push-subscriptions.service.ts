import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';

export type PushSubscriptionPayload = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
};

class PushSubscriptionsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async getVapidPublicKey(): Promise<string> {
        const response = await this.httpClient.get<{ publicKey: string }>(
            '/push-subscriptions/vapid-public-key',
        );
        return response.data.publicKey;
    }

    public async subscribe(payload: PushSubscriptionPayload): Promise<void> {
        await this.httpClient.post('/push-subscriptions', payload);
    }

    public async unsubscribe(endpoint: string): Promise<void> {
        await this.httpClient.delete('/push-subscriptions', {
            data: { endpoint },
        });
    }
}

export const pushSubscriptionsService = new PushSubscriptionsService();
