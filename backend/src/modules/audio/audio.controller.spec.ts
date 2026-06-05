import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard, TeacherGuard } from '../../auth/guards/auth.guard';
import { SupabaseService } from '../../config/supabase.client';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';

const mockAudioService = { textToSpeech: jest.fn() };
const mockSupabaseService = { createSignedUrl: jest.fn() };

describe('AudioController', () => {
    let controller: AudioController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AudioController],
            providers: [
                { provide: AudioService, useValue: mockAudioService },
                { provide: SupabaseService, useValue: mockSupabaseService },
            ],
        })
            .overrideGuard(TeacherGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AudioController>(AudioController);
        jest.clearAllMocks();
    });

    describe('convertTextToSpeech', () => {
        it('should call audioService and send the buffer as audio/mpeg', async () => {
            const dto = { text: 'Hello world' } as any;
            const buffer = Buffer.from([1, 2, 3]);
            mockAudioService.textToSpeech.mockResolvedValue(buffer);

            const res = { set: jest.fn(), send: jest.fn() };

            await controller.convertTextToSpeech(dto, res as any);

            expect(mockAudioService.textToSpeech).toHaveBeenCalledWith(dto);
            expect(res.set).toHaveBeenCalledWith({
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length,
            });
            expect(res.send).toHaveBeenCalledWith(buffer);
        });
    });

    describe('getSignedUrl', () => {
        it('should return a signed URL from supabase', async () => {
            const dto = { bucket: 'audio', path: 'files/hello.mp3' } as any;
            mockSupabaseService.createSignedUrl.mockResolvedValue(
                'https://signed.url',
            );

            const result = await controller.getSignedUrl(dto);

            expect(mockSupabaseService.createSignedUrl).toHaveBeenCalledWith(
                'audio',
                'files/hello.mp3',
            );
            expect(result).toEqual({ url: 'https://signed.url' });
        });
    });
});
