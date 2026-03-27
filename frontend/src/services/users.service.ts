import type { AxiosInstance } from "axios";
import type { AuthUser } from "../types/auth";
import { httpClientService } from "./http-client.service";

class UsersService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async listAllStudents(): Promise<AuthUser[]> {
        const response =
            await this.httpClient.get<AuthUser[]>("/users/students");
        return response.data;
    }

    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/users/${id}`);
    }
}

export const usersService = new UsersService();
