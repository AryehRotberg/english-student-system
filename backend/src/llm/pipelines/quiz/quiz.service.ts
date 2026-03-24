import { Injectable } from '@nestjs/common';
import { LlmService } from '../../llm.service';
import { quizPipeline } from '../../pipelines/quiz/quiz.pipeline';

@Injectable()
export class QuizService {
    constructor(private readonly llm: LlmService) {}

    generateQuiz(input: {
        topic: string;
        openEndedCount: number;
        multipleChoiceCount: number;
    }) {
        return this.llm.runPipeline(quizPipeline, input);
    }
}
