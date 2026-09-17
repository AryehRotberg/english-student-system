import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';

export type StudentAnswerApiItem = {
    id: string;
    attemptId: string;
    questionId: string;
    blankIndex: number;
    selectedOptionId: string | null;
    textAnswer: string | null;
    createdAt: string;
    // Official grade; null until graded on teacher-graded quizzes, and hidden
    // from students until the teacher finalizes grading.
    points: number | null;
    // Automatic grading suggestion; only visible to teachers.
    autoPoints: number | null;
    gradedAt: string | null;
    gradedBy: string | null;
    feedback: string | null;
};

class StudentAnswersService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findByAttempt(
        attemptId?: string,
    ): Promise<StudentAnswerApiItem[]> {
        const response = await this.httpClient.get<StudentAnswerApiItem[]>(
            `/student-answers/attempt/${attemptId}`,
        );
        return response.data;
    }

    public async upsert(payload: {
        attemptId: string;
        questionId: string;
        textAnswers?: string[] | null;
        selectedOptionId?: string | null;
        feedback?: string | null;
    }) {
        const response = await this.httpClient.post(
            '/student-answers',
            payload,
        );
        return response.data;
    }

    public async grade(
        id: string,
        points: number,
    ): Promise<StudentAnswerApiItem> {
        const response = await this.httpClient.patch<StudentAnswerApiItem>(
            `/student-answers/${id}/grade`,
            { points },
        );
        return response.data;
    }
}

export const studentAnswersService = new StudentAnswersService();
