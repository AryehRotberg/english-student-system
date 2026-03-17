import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';

class UsersService {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = httpClientService.getInstance();
  }

  public async remove(id: string): Promise<void> {
    await this.httpClient.delete(`/users/${id}`);
  }
}

export const usersService = new UsersService();
