import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../../config/supabase.client';
import { AudioService } from './audio.service';
import { AudioCreateSpeechDto } from './dto/audio.create-speech.dto';

const mockSupabaseService = {
    uploadToBucket: jest.fn(),
};

const mockElevenLabsClient = {
    textToSpeech: {
        convert: jest.fn(),
    },
};

jest.mock('@elevenlabs/elevenlabs-js', () => ({
    ElevenLabsClient: jest.fn().mockImplementation(() => mockElevenLabsClient),
}));

describe('AudioService', () => {
    let service: AudioService;

    beforeEach(async () => {
        jest.spyOn(console, 'error').mockImplementation(() => undefined);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AudioService,
                { provide: SupabaseService, useValue: mockSupabaseService },
            ],
        }).compile();

        service = module.get<AudioService>(AudioService);
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('textToSpeech', () => {
        const audioBytes = new Uint8Array([1, 2, 3]);

        async function* makeStream() {
            yield audioBytes;
        }

        it('should convert text to speech and return a Buffer', async () => {
            const dto: AudioCreateSpeechDto = { text: 'Hello world' };
            mockElevenLabsClient.textToSpeech.convert.mockResolvedValue(
                makeStream(),
            );

            const result = await service.textToSpeech(dto);

            expect(
                mockElevenLabsClient.textToSpeech.convert,
            ).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ text: 'Hello world' }),
            );
            expect(result).toBeInstanceOf(Buffer);
            expect(mockSupabaseService.uploadToBucket).not.toHaveBeenCalled();
        });

        it('should upload to bucket when bucket and path are provided', async () => {
            const dto: AudioCreateSpeechDto = {
                text: 'Hello',
                bucket: 'audio',
                path: 'files/hello.mp3',
            };
            mockElevenLabsClient.textToSpeech.convert.mockResolvedValue(
                makeStream(),
            );
            mockSupabaseService.uploadToBucket.mockResolvedValue(undefined);

            await service.textToSpeech(dto);

            expect(mockSupabaseService.uploadToBucket).toHaveBeenCalledWith(
                expect.any(Buffer),
                'audio',
                'files/hello.mp3',
            );
        });

        it('should throw when ElevenLabs API throws', async () => {
            const dto: AudioCreateSpeechDto = { text: 'Hello' };
            mockElevenLabsClient.textToSpeech.convert.mockRejectedValue(
                new Error('API error'),
            );

            await expect(service.textToSpeech(dto)).rejects.toThrow(
                'API error',
            );
        });
    });
});
