import { httpClient } from './http-client.service';

export const writingSubmissionsService = {
  list: (filters?: { userId?: string; taskId?: string }) => {
    const params = new URLSearchParams();

    if (filters?.userId) params.set('userId', filters.userId);
    if (filters?.taskId) params.set('taskId', filters.taskId);

    const query = params.toString();
    return httpClient.get(`/writing-submissions${query ? `?${query}` : ''}`);
  },
  create: (payload: { taskId: string; userId: string; content: string }) =>
    httpClient.post('/writing-submissions', payload),
  update: (id: string, payload: Partial<{ feedback: string; score: number; reviewedAt: string }>) =>
    httpClient.patch(`/writing-submissions/${id}`, payload),
};
