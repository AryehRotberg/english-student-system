import { httpClient } from './http-client.service';

export const quizAttemptsService = {
  listByUserAndQuiz: (userId: string, quizId: string) =>
    httpClient.get(`/quiz-attempts?userId=${userId}&quizId=${quizId}`),
  create: (payload: {
    quizId: string;
    userId: string;
    points?: number;
    startedAt?: string;
    completedAt?: string;
  }) => httpClient.post('/quiz-attempts', payload),
  update: (id: string, payload: Partial<{
    quizId: string;
    userId: string;
    points: number;
    startedAt: string;
    completedAt: string;
  }>) => httpClient.patch(`/quiz-attempts/${id}`, payload),
};
