import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Injectable } from '@nestjs/common';
import Sentry from '../../config/sentry';
import { SupabaseService } from '../../config/supabase.client';
import { AudioCreateSpeechDto } from './dto/audio.create-speech.dto';

type AudioModelId = 'eleven_v3' | 'eleven_flash_v2_5';

@Injectable()
export class AudioService {
    private elevenlabs: ElevenLabsClient;
    private modelId: AudioModelId = 'eleven_flash_v2_5';

    constructor(private readonly supabaseService: SupabaseService) {
        this.elevenlabs = new ElevenLabsClient();
    }

    async textToSpeech(dto: AudioCreateSpeechDto): Promise<Buffer> {
        const {
            text,
            voiceId = 'BtWabtumIemAotTjP5sk',
            speed = 1.0,
            bucket,
            path,
        } = dto;

        try {
            const audioStream = await this.elevenlabs.textToSpeech.convert(
                voiceId,
                {
                    text: text,
                    modelId: this.modelId,
                    voiceSettings: {
                        speed: speed,
                        stability: 0.32,
                        similarityBoost: 0.87,
                    },
                    outputFormat: 'mp3_44100_128',
                },
            );

            const buffer = await this.streamToBuffer(audioStream);

            if (bucket && path) {
                await this.supabaseService.uploadToBucket(buffer, bucket, path);
            }

            return buffer;
        } catch (error) {
            console.error('Error converting text to speech:', error);
            Sentry.captureException(error);
            throw error;
        }
    }

    private async streamToBuffer(
        stream: AsyncIterable<Uint8Array>,
    ): Promise<Buffer> {
        const chunks: Uint8Array[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }
}
