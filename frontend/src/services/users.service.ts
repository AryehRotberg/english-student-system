import { httpClient } from './http-client.service';

export const usersService = {
  remove: (id: string) => httpClient.delete(`/users/${id}`),
};
