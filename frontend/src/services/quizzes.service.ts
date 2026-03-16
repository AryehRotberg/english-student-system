import { httpClient } from './http-client.service';
import type { QuizSummary, QuizTopic } from '../types/quiz';

export const quizzesService = {
  list: () => httpClient.get<QuizSummary[]>('/quizzes'),
  listTopics: (quizId: string) => httpClient.get<QuizTopic[]>(`/quizzes/${quizId}/topics`),
  create: (payload: { title: string; description?: string }) => httpClient.post('/quizzes', payload),
};
