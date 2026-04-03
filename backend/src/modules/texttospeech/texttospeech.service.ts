import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Injectable, Logger } from '@nestjs/common';
import { CreateSpeechDto } from './dto/create-speech-dto';

@Injectable()
export class TexttospeechService {
    private elevenlabs: ElevenLabsClient;

    constructor() {
        this.elevenlabs = new ElevenLabsClient();
    }

    async textToSpeech(createSpeechDto: CreateSpeechDto): Promise<Buffer> {
        const {
            text,
            voiceId = 'BtWabtumIemAotTjP5sk',
            speed = 0.9,
        } = createSpeechDto;

        try {
            const audioStream = await this.elevenlabs.textToSpeech.convert(
                voiceId,
                {
                    text: text,
                    modelId: 'eleven_flash_v2_5',
                    voiceSettings: {
                        speed: speed,
                    },
                    outputFormat: 'mp3_44100_128',
                },
            );

            const chunks: Uint8Array[] = [];

            for await (const chunk of audioStream) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        } catch (error) {
            console.error('Error converting text to speech:', error);
            throw error;
        }
    }
}
