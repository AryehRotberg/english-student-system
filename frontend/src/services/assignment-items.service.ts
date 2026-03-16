import { httpClient } from './http-client.service';

export const assignmentItemsService = {
  listByUser: (userId: string) => httpClient.get(`/assignment-items?userId=${userId}`),
  create: (payload: {
    assignmentId: string;
    contentType: 'quiz' | 'text' | 'writing';
    contentId?: string;
  }) => httpClient.post('/assignment-items', payload),
};
