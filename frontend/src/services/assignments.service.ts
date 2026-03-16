import { httpClient } from './http-client.service';

export const assignmentsService = {
  listByUser: (userId: string) => httpClient.get(`/assignments?userId=${userId}`),
  create: (payload: {
    userId: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'assigned' | 'completed';
  }) => httpClient.post('/assignments', payload),
};
