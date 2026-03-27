export interface LlmPipeline<TInput, TOutput> {
    buildPrompt(input: TInput): string;

    schema: any;

    validate?(output: any): void;

    transform?(output: any): TOutput;
}
