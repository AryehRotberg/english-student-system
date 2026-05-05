import type { AxiosInstance } from 'axios';
import type { AuthUser } from '../types/auth';
import { httpClientService } from './http-client.service';

class UsersService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findStudentsByTeacherId(approved = true): Promise<AuthUser[]> {
        const response = await this.httpClient.get<AuthUser[]>(
            '/users/students',
            { params: { approved: String(approved) } },
        );
        return response.data;
    }

    public async findAllTeachers(): Promise<AuthUser[]> {
        const response =
            await this.httpClient.get<AuthUser[]>('/users/teachers');
        return response.data;
    }

    public async approve(id: string): Promise<AuthUser> {
        const response = await this.httpClient.patch<AuthUser>(
            `/users/${id}/approve`,
        );
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/users/${id}`);
    }
}

export const usersService = new UsersService();
