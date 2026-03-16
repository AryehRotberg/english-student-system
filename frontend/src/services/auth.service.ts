import { httpClient } from './http-client.service';
import type { AuthUser } from '../types/auth';

type LoginResponse = {
  message: string;
  user: AuthUser;
};

export const authService = {
  login: (payload: { email: string; password: string }) =>
    httpClient.post<LoginResponse>('/auth/login', payload),
  register: (payload: { name: string; email: string; password: string }) =>
    httpClient.post('/auth/register', payload),
  me: () => httpClient.get<AuthUser>('/auth/user'),
  logout: () => httpClient.post('/auth/logout', {}),
};
