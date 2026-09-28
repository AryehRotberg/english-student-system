import type { AxiosInstance } from 'axios';
import type { RawQuizQuestionAdminItem } from '../types/admin-query-items';
import type { QuizQuestion } from '../types/quiz';
import { httpClientService } from './http-client.service';

class QuizQuestionsService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async getFullQuiz(quizId?: string): Promise<QuizQuestion[]> {
        if (!quizId) {
            return [];
        }

        const response = await this.httpClient.get(
            `/quiz-questions/${quizId}/full`,
        );

        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No quiz questions found for this quiz.');
        }

        return data as QuizQuestion[];
    }

    public async findByUserId(
        quizId?: string,
    ): Promise<RawQuizQuestionAdminItem[]> {
        if (!quizId) {
            return [];
        }

        const data = await this.httpClient
            .get(`/quiz-questions?quizId=${quizId}`)
            .then((res) => res.data);
        return Array.isArray(data) ? (data as RawQuizQuestionAdminItem[]) : [];
    }

    public async create(payload: {
        quizId: string;
        questionId: string;
        maxPoints: number;
        orderIndex?: number;
    }) {
        const response = await this.httpClient.post('/quiz-questions', payload);
        return response.data;
    }

    public async update(
        id: string,
        payload: Partial<{
            quizId: string;
            questionId: string;
            maxPoints: number;
            orderIndex: number;
        }>,
    ) {
        const response = await this.httpClient.patch(
            `/quiz-questions/${id}`,
            payload,
        );
        return response.data;
    }

    /** Takes the question out of the quiz; the question stays in the bank. */
    public async remove(id: string): Promise<void> {
        await this.httpClient.delete(`/quiz-questions/${id}`);
    }
}

export const quizQuestionsService = new QuizQuestionsService();
