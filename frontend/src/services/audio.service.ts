import axios from "axios";
import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";

export type VocabAudioType = "word" | "meaning" | "example";

export class AudioNotFoundError extends Error {
    constructor() {
        super("Audio not available");
        this.name = "AudioNotFoundError";
    }
}

function buildVocabPath(word: string, type: VocabAudioType): string {
    const lower = word.toLowerCase();
    return type === "word" ? `${lower}.mp3` : `${lower}_${type}.mp3`;
}

class AudioService {
    private readonly httpClient: AxiosInstance;

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    async fetchVocabAudio(word: string, type: VocabAudioType): Promise<string> {
        const path = buildVocabPath(word, type);

        try {
            const response = await this.httpClient.get<ArrayBuffer>(
                "/audio/download",
                {
                    params: { bucket: "vocabulary", path },
                    responseType: "arraybuffer",
                },
            );

            const blob = new Blob([response.data], { type: "audio/mpeg" });
            return URL.createObjectURL(blob);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 400) {
                throw new AudioNotFoundError();
            }
            throw err;
        }
    }
}

export const audioService = new AudioService();
