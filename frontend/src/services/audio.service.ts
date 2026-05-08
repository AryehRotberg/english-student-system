import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';

export type VocabAudioType = 'word' | 'meaning' | 'example';

export class AudioNotFoundError extends Error {
    constructor() {
        super('Audio not available');
        this.name = 'AudioNotFoundError';
    }
}

function buildVocabPath(word: string, type: VocabAudioType): string {
    const lower = word.toLowerCase();
    return type === 'word' ? `${lower}.mp3` : `${lower}_${type}.mp3`;
}

class AudioService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    async downloadAudio(bucket: string, path: string): Promise<string> {
        try {
            const response = await this.httpClient.get<{ url: string }>(
                '/audio/signed-url',
                { params: { bucket, path } },
            );
            return response.data.url;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 400) {
                throw new AudioNotFoundError();
            }
            throw err;
        }
    }

    fetchVocabAudio(word: string, type: VocabAudioType): Promise<string> {
        return this.downloadAudio('vocabulary', buildVocabPath(word, type));
    }

    fetchQuestionAudio(questionId: string): Promise<string> {
        return this.downloadAudio('questions', `${questionId}.mp3`);
    }
}

export const audioService = new AudioService();
