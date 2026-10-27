import type { AxiosInstance } from 'axios';
import type { QuizStudyGuide } from '../types/quiz';
import { httpClientService } from './http-client.service';

class QuizStudyGuidesService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findByQuizId(quizId: string): Promise<QuizStudyGuide[]> {
        const response = await this.httpClient.get<QuizStudyGuide[]>(
            `/quiz-study-guides/${quizId}`,
        );
        return response.data;
    }

    // Replaces the quiz's lessons with exactly this set.
    public async setForQuiz(
        quizId: string,
        studyGuideIds: string[],
    ): Promise<QuizStudyGuide[]> {
        const response = await this.httpClient.put<QuizStudyGuide[]>(
            `/quiz-study-guides/${quizId}`,
            { studyGuideIds },
        );
        return response.data;
    }
}

export const quizStudyGuidesService = new QuizStudyGuidesService();
