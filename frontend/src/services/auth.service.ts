import type { AxiosInstance } from 'axios';
import type { AuthUser } from '../types/auth';
import { httpClientService } from './http-client.service';

type LoginResponse = {
    message: string;
    user: AuthUser;
};

class AuthService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async login(payload: {
        email: string;
        password: string;
    }): Promise<LoginResponse> {
        const response = await this.httpClient.post<LoginResponse>(
            '/auth/login',
            payload,
        );
        return response.data;
    }

    public async register(payload: {
        name: string;
        email: string;
        password: string;
    }) {
        const response = await this.httpClient.post('/auth/register', payload);
        return response.data;
    }

    public async getUser(): Promise<AuthUser | null> {
        try {
            const response = await this.httpClient.get<AuthUser>('/auth/user');
            return response.data;
        } catch {
            return null;
        }
    }

    public async logout() {
        const response = await this.httpClient.post('/auth/logout', {});
        return response.data;
    }
}

export const authService = new AuthService();
