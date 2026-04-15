import { ChatAnthropic } from '@langchain/anthropic';
import { Injectable } from '@nestjs/common';
import { traceable } from 'langsmith/traceable';
import { LlmPipeline } from './llm.types';

@Injectable()
export class LlmService {
    LLM_MODEL = 'claude-haiku-4-5-20251001';

    private readonly model = new ChatAnthropic({
        model: this.LLM_MODEL,
        temperature: 0.7,
        maxRetries: 1,
    });

    withStructuredOutput(schema: any) {
        return this.model.withStructuredOutput(schema);
    }

    async runPipeline<TInput, TOutput>(
        pipeline: LlmPipeline<TInput, TOutput>,
        input: TInput,
    ): Promise<TOutput> {
        const tracedFunction = traceable(
            async (input: TInput) => {
                const prompt = pipeline.buildPrompt(input);
                const structured = this.withStructuredOutput(pipeline.schema);
                const result = await structured.invoke(prompt);

                if (pipeline.validate) {
                    pipeline.validate(result);
                }

                return pipeline.transform
                    ? pipeline.transform(result)
                    : (result as TOutput);
            },
            {
                name: pipeline.constructor.name || 'RunPipeline',
                run_type: 'chain',
            },
        ) as (input: TInput) => Promise<TOutput>;
        return await tracedFunction(input);
    }
}
