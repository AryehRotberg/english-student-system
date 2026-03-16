import { httpClient } from './http-client.service';

export const questionOptionsService = {
  listByQuestion: (questionId: string) =>
    httpClient.get(`/question-options?questionId=${questionId}`),
  create: (payload: { questionId: string; optionText: string; isCorrect: boolean }) =>
    httpClient.post('/question-options', payload),
  update: (id: string, payload: Partial<{ questionId: string; optionText: string; isCorrect: boolean }>) =>
    httpClient.patch(`/question-options/${id}`, payload),
};
