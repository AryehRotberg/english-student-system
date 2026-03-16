import { httpClient } from './http-client.service';

export type StudentAnswerApiItem = {
  id: string;
  attemptId: string;
  questionId: string;
  answerData: Record<string, unknown>;
  createdAt: string;
  points: number | null;
  feedback: string | null;
};

export const studentAnswersService = {
  list: () => httpClient.get<StudentAnswerApiItem[]>('/student-answers'),
  create: (payload: {
    attemptId: string;
    questionId: string;
    answerData: Record<string, unknown>;
    feedback?: string;
  }) => httpClient.post('/student-answers', payload),
  update: (id: string, payload: Partial<{
    answerData: Record<string, unknown>;
    feedback: string;
    points: number;
  }>) => httpClient.patch(`/student-answers/${id}`, payload),
};
