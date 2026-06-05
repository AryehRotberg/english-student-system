import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';

const mockInvoke = jest.fn();
const mockWithStructuredOutput = jest
    .fn()
    .mockReturnValue({ invoke: mockInvoke });

jest.mock('@langchain/anthropic', () => ({
    ChatAnthropic: jest.fn().mockImplementation(() => ({
        withStructuredOutput: mockWithStructuredOutput,
    })),
}));

jest.mock('langsmith/traceable', () => ({
    traceable: (fn: any) => fn,
}));

describe('LlmService', () => {
    let service: LlmService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LlmService],
        }).compile();

        service = module.get<LlmService>(LlmService);
        jest.clearAllMocks();
        mockWithStructuredOutput.mockReturnValue({ invoke: mockInvoke });
    });

    describe('withStructuredOutput', () => {
        it('should delegate to the underlying model', () => {
            const schema = { type: 'object' };

            service.withStructuredOutput(schema);

            expect(mockWithStructuredOutput).toHaveBeenCalledWith(schema);
        });
    });

    describe('runPipeline', () => {
        it('should call buildPrompt, invoke, and return the result', async () => {
            const rawResult = { answer: '42' };
            mockInvoke.mockResolvedValue(rawResult);

            const pipeline = {
                buildPrompt: jest.fn().mockReturnValue('test prompt'),
                schema: { type: 'object' },
            };

            const result = await service.runPipeline(pipeline as any, {
                question: 'What is the answer?',
            });

            expect(pipeline.buildPrompt).toHaveBeenCalledWith({
                question: 'What is the answer?',
            });
            expect(mockWithStructuredOutput).toHaveBeenCalledWith(
                pipeline.schema,
            );
            expect(mockInvoke).toHaveBeenCalledWith('test prompt');
            expect(result).toEqual(rawResult);
        });

        it('should call validate when provided', async () => {
            const rawResult = { answer: '42' };
            mockInvoke.mockResolvedValue(rawResult);

            const pipeline = {
                buildPrompt: jest.fn().mockReturnValue('prompt'),
                schema: {},
                validate: jest.fn(),
            };

            await service.runPipeline(pipeline as any, {});

            expect(pipeline.validate).toHaveBeenCalledWith(rawResult);
        });

        it('should apply transform when provided and return its result', async () => {
            const rawResult = { value: 1 };
            const transformed = { value: 2 };
            mockInvoke.mockResolvedValue(rawResult);

            const pipeline = {
                buildPrompt: jest.fn().mockReturnValue('prompt'),
                schema: {},
                transform: jest.fn().mockReturnValue(transformed),
            };

            const result = await service.runPipeline(pipeline as any, {});

            expect(pipeline.transform).toHaveBeenCalledWith(rawResult);
            expect(result).toEqual(transformed);
        });

        it('should call both validate and transform in order', async () => {
            const rawResult = { v: 0 };
            const transformed = { v: 99 };
            mockInvoke.mockResolvedValue(rawResult);

            const callOrder: string[] = [];
            const pipeline = {
                buildPrompt: jest.fn().mockReturnValue('p'),
                schema: {},
                validate: jest.fn().mockImplementation(() => {
                    callOrder.push('validate');
                }),
                transform: jest.fn().mockImplementation(() => {
                    callOrder.push('transform');
                    return transformed;
                }),
            };

            const result = await service.runPipeline(pipeline as any, {});

            expect(callOrder).toEqual(['validate', 'transform']);
            expect(result).toEqual(transformed);
        });
    });
});
