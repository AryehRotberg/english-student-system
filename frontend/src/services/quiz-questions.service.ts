import { httpClient } from './http-client.service';

export const quizQuestionsService = {
  listByQuiz: (quizId: string) => httpClient.get(`/quiz-questions?quizId=${quizId}`),
  create: (payload: { quizId: string; questionId: string; maxPoints: number }) =>
    httpClient.post('/quiz-questions', payload),
  update: (id: string, payload: Partial<{ quizId: string; questionId: string; maxPoints: number }>) =>
    httpClient.patch(`/quiz-questions/${id}`, payload),
};
