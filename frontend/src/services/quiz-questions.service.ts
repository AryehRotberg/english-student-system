import type { AxiosInstance } from 'axios';
import { answersService } from './answers.service';
import { httpClientService } from './http-client.service';
import { questionOptionsService } from './question-options.service';
import type { AnswerApiItem } from '../types/api-items/answer';
import type { QuestionOptionApiItem } from '../types/api-items/question-option';
import type { QuizQuestionApiItem } from '../types/api-items/quiz-question';
import type { RawQuizQuestionAdminItem } from '../types/admin-query-items';
import type { QuizQuestion } from '../types/quiz';

class QuizQuestionsService {
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = httpClientService.getInstance();
  }

  public async listByQuiz(quizId: string) {
    const response = await this.httpClient.get(`/quiz-questions?quizId=${quizId}`);
    return response.data;
  }

  public async listForQuiz(quizId?: string): Promise<QuizQuestion[]> {
    if (!quizId) {
      return [];
    }

    const data = (await this.listByQuiz(quizId)) as QuizQuestionApiItem[];

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No quiz questions found for this quiz.');
    }

    const questionIds = Array.from(new Set(data.map((question) => question.questionId)));

    const [allAnswersRaw, optionEntries] = await Promise.all([
      answersService.list(),
      Promise.all(
        questionIds.map(async (questionId) => {
          const options = (await questionOptionsService.listByQuestion(questionId)) as QuestionOptionApiItem[];
          return [questionId, options] as const;
        }),
      ),
    ]);

    const allAnswers = allAnswersRaw as AnswerApiItem[];
    const optionsByQuestionId = new Map<string, QuestionOptionApiItem[]>(optionEntries);

    const blankCountByQuestionId = allAnswers.reduce((map, answer) => {
      const currentMax = map.get(answer.questionId) ?? 0;
      map.set(answer.questionId, Math.max(currentMax, Number(answer.blankIndex)));
      return map;
    }, new Map<string, number>());

    return data.map((question, index) => {
      const optionData = optionsByQuestionId.get(question.questionId) ?? [];

      return {
        id: question.id,
        questionId: question.questionId,
        prompt: question.question ?? question.prompt ?? 'Question text not available.',
        questionType: question.questionType ?? (optionData.length > 0 ? 'multiple_choice' : 'open_ended'),
        maxPoints: Number(question.maxPoints ?? 0),
        questionNumber: index + 1,
        totalQuestions: data.length,
        blankCount: blankCountByQuestionId.get(question.questionId) ?? 0,
        options: optionData.map((option) => ({
          id: option.id,
          value: option.optionText,
          label: option.optionText,
        })),
      };
    });
  }

  public async listRawAdminByQuiz(quizId?: string): Promise<RawQuizQuestionAdminItem[]> {
    if (!quizId) {
      return [];
    }

    const data = await this.listByQuiz(quizId);
    return Array.isArray(data) ? (data as RawQuizQuestionAdminItem[]) : [];
  }

  public async create(payload: { quizId: string; questionId: string; maxPoints: number }) {
    const response = await this.httpClient.post('/quiz-questions', payload);
    return response.data;
  }

  public async update(id: string, payload: Partial<{ quizId: string; questionId: string; maxPoints: number }>) {
    const response = await this.httpClient.patch(`/quiz-questions/${id}`, payload);
    return response.data;
  }
}

export const quizQuestionsService = new QuizQuestionsService();
