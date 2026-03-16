import { httpClient } from './http-client.service';

export const textsService = {
  list: () => httpClient.get('/texts'),
  create: (payload: { title: string; content: string; level: string }) =>
    httpClient.post('/texts', payload),
};
