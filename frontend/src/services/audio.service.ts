import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { httpClientService } from './http-client.service';

export type AudioBucket = 'texts' | 'questions' | 'vocabulary';

export type VocabAudioType = 'word' | 'meaning' | 'example';

export class AudioNotFoundError extends Error {
    constructor() {
        super('Audio not available');
        this.name = 'AudioNotFoundError';
    }
}

export class AudioUploadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AudioUploadError';
    }
}

function buildVocabPath(word: string, type: VocabAudioType): string {
    const lower = word.toLowerCase();
    return type === 'word' ? `${lower}.mp3` : `${lower}_${type}.mp3`;
}

export function buildTextAudioPath(textId: string): string {
    return `audio/${textId}.mp3`;
}

class AudioService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    async downloadAudio(bucket: AudioBucket, path: string): Promise<string> {
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

    fetchTextAudio(textId: string): Promise<string> {
        return this.downloadAudio('texts', buildTextAudioPath(textId));
    }

    async uploadAudio(
        bucket: AudioBucket,
        path: string,
        file: File,
    ): Promise<void> {
        const formData = new FormData();
        formData.append('File', file);
        formData.append('Bucket', bucket);
        formData.append('Path', path);

        try {
            await this.httpClient.post('/audio/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 400) {
                const message = (err.response.data as { message?: string })
                    ?.message;
                throw new AudioUploadError(message ?? 'Audio upload failed.');
            }
            throw err;
        }
    }

    uploadTextAudio(textId: string, file: File): Promise<void> {
        return this.uploadAudio('texts', buildTextAudioPath(textId), file);
    }

    async generateAndSaveTts(
        text: string,
        bucket: AudioBucket,
        path: string,
    ): Promise<void> {
        await this.httpClient.post(
            '/audio/tts',
            { text, bucket, path },
            { responseType: 'arraybuffer' },
        );
    }
}

export const audioService = new AudioService();
