import { httpClient } from './http-client.service';

export const questionsService = {
  list: () => httpClient.get('/questions'),
  create: (payload: { question: string; questionType: string; audioUrl?: string }) =>
    httpClient.post('/questions', payload),
};
