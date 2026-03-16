import { httpClient } from './http-client.service';

export const writingTasksService = {
  list: () => httpClient.get('/writing-tasks'),
  create: (payload: { title: string; instructions: string; minWords: number }) =>
    httpClient.post('/writing-tasks', payload),
};
