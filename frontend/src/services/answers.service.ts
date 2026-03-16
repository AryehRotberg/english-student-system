import { httpClient } from './http-client.service';

export const answersService = {
    list: () => httpClient.get('/answers'),
    create: (payload: { questionId: string; answer: string; blankIndex: number }) =>
        httpClient.post('/answers', payload),
    update: (id: string, payload: Partial<{ questionId: string; answer: string; blankIndex: number }>) =>
        httpClient.patch(`/answers/${id}`, payload),
};
