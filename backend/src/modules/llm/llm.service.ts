// import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatAnthropic } from '@langchain/anthropic';
import { Injectable } from '@nestjs/common';
import { LlmPipeline } from './llm.types';

@Injectable()
export class LlmService {
    // private readonly model = new ChatGoogleGenerativeAI({
    //     model: 'gemini-3-flash-preview',
    //     // model: 'gemini-3.1-flash-lite-preview',
    //     temperature: 0.7,
    //     maxRetries: 1,
    // });

    LLM_MODEL = 'claude-haiku-4-5-20251001';

    private readonly model = new ChatAnthropic({
        model: this.LLM_MODEL,
        temperature: 0.7,
        maxRetries: 1,
    });

    withStructuredOutput(schema: any) {
        return this.model.withStructuredOutput(schema);
    }

    getRawModel() {
        return this.model;
    }

    async runPipeline<TInput, TOutput>(
        pipeline: LlmPipeline<TInput, TOutput>,
        input: TInput,
    ): Promise<TOutput> {
        const prompt = pipeline.buildPrompt(input);

        const structured = this.withStructuredOutput(pipeline.schema);

        const result = await structured.invoke(prompt);

        if (pipeline.validate) {
            pipeline.validate(result);
        }

        return pipeline.transform
            ? pipeline.transform(result)
            : (result as TOutput);
    }
}
