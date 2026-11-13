import type { AxiosInstance } from 'axios';
import type { MorningClient, PaymentMethod, Receipt } from '../types/receipt';
import { httpClientService } from './http-client.service';

export type CreateReceiptPayload = {
    studentId: string;
    amount: number;
    paymentMethod: PaymentMethod;
};

class BillingService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async createReceipt(payload: CreateReceiptPayload): Promise<Receipt> {
        const response = await this.httpClient.post<Receipt>(
            '/billing/receipts',
            payload,
        );
        return response.data;
    }

    public async findReceipts(studentId?: string, limit = 20): Promise<Receipt[]> {
        const response = await this.httpClient.get<Receipt[]>('/billing/receipts', {
            params: { studentId, limit },
        });
        return response.data;
    }

    public async searchMorningClients(search: string): Promise<MorningClient[]> {
        const response = await this.httpClient.get<MorningClient[]>(
            '/billing/morning-clients',
            { params: { search } },
        );
        return response.data;
    }
}

export const billingService = new BillingService();
