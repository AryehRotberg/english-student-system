import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';
import type { QuizAttemptApiItem } from '../types/api-items/quiz-attempt';

class QuizAttemptsService {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = httpClientService.getInstance();
  }

  public async listByUserAndQuiz(userId: string, quizId: string) {
    const response = await this.httpClient.get(`/quiz-attempts?userId=${userId}&quizId=${quizId}`);
    return response.data;
  }

  public async listByUserAndQuizSorted(userId?: string, quizId?: string): Promise<QuizAttemptApiItem[]> {
    if (!userId || !quizId) {
      return [];
    }

    const attempts = (await this.listByUserAndQuiz(userId, quizId)) as QuizAttemptApiItem[];

    return attempts.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
  }

  public async getOrCreateActiveAttemptId(quizId?: string, userId?: string): Promise<string> {
    if (!userId || !quizId) {
      throw new Error('Missing quiz attempt context');
    }

    const attempts = await this.listByUserAndQuizSorted(userId, quizId);
    const inProgressAttempt = attempts.find((attempt) => attempt.completedAt === null);

    if (inProgressAttempt) {
      return inProgressAttempt.id;
    }

    const createdAttempt = (await this.create({
      quizId,
      userId,
      points: 0,
      startedAt: new Date().toISOString(),
    })) as { id: string };

    return createdAttempt.id;
  }

  public async create(payload: {
    quizId: string;
    userId: string;
    points?: number;
    startedAt?: string;
    completedAt?: string;
  }) {
    const response = await this.httpClient.post('/quiz-attempts', payload);
    return response.data;
  }

  public async update(id: string, payload: Partial<{
    quizId: string;
    userId: string;
    points: number;
    startedAt: string;
    completedAt: string;
  }>) {
    const response = await this.httpClient.patch(`/quiz-attempts/${id}`, payload);
    return response.data;
  }
}

export const quizAttemptsService = new QuizAttemptsService();
