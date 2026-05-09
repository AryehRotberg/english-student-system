import type { AxiosInstance } from 'axios';
import type { VocabularyTopicApiItem } from '../types/api-items/vocabulary-topic';
import type { VocabularyTopicWordApiItem } from '../types/api-items/vocabulary-topic-word';
import type {
    VocabularyTopicPreview,
    VocabularyTopicWithWords,
    VocabularyWord,
} from '../types/vocabulary';
import { httpClientService } from './http-client.service';

class VocabularyService {
    private readonly httpClient: AxiosInstance;

    private toTopicPreview(
        topic: VocabularyTopicApiItem,
    ): VocabularyTopicPreview {
        return {
            id: topic.id,
            topic: topic.topic?.trim() || 'Untitled topic',
            description: topic.description,
            createdAt: topic.createdAt,
        };
    }

    private toVocabularyWord(word: VocabularyTopicWordApiItem): VocabularyWord {
        return {
            id: word.id,
            vocabularyId: word.vocabularyId,
            word: word.word?.trim() || '',
            meaning: word.meaning,
            example: word.example,
            translation: word.translation,
        };
    }

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async findAll(): Promise<VocabularyTopicApiItem[]> {
        const response =
            await this.httpClient.get<VocabularyTopicApiItem[]>(
                '/vocabulary-topics',
            );
        return Array.isArray(response.data) ? response.data : [];
    }

    public async findByTopicId(
        topicId: string,
    ): Promise<VocabularyTopicWordApiItem[]> {
        const response = await this.httpClient.get<
            VocabularyTopicWordApiItem[]
        >(`/vocabulary-topic-words?topicId=${topicId}`);
        return Array.isArray(response.data) ? response.data : [];
    }

    public async listTopicsPreview(): Promise<VocabularyTopicPreview[]> {
        const topics = await this.findAll();
        return topics.map((topic) => this.toTopicPreview(topic));
    }

    public async listWordsForTopic(topicId: string): Promise<VocabularyWord[]> {
        const words = await this.findByTopicId(topicId);

        return words
            .filter((word) => Boolean(word.word?.trim()))
            .map((word) => this.toVocabularyWord(word));
    }

    public async listTopicsWithWords(): Promise<VocabularyTopicWithWords[]> {
        const topics = await this.listTopicsPreview();

        const topicWordPairs = await Promise.all(
            topics.map(async (topic) => {
                const words = await this.listWordsForTopic(topic.id);
                return [topic, words] as const;
            }),
        );

        return topicWordPairs.map(([topic, words]) => ({
            id: topic.id,
            topic: topic.topic,
            description: topic.description,
            createdAt: topic.createdAt,
            words,
        }));
    }

    public async createTopic(payload: {
        topic: string;
        description?: string;
    }): Promise<VocabularyTopicPreview> {
        const response = await this.httpClient.post<VocabularyTopicApiItem>(
            '/vocabulary-topics',
            payload,
        );
        return this.toTopicPreview(response.data);
    }

    public async updateTopic(
        id: string,
        payload: { topic?: string; description?: string },
    ): Promise<VocabularyTopicPreview> {
        const response = await this.httpClient.patch<VocabularyTopicApiItem>(
            `/vocabulary-topics/${id}`,
            payload,
        );
        return this.toTopicPreview(response.data);
    }

    public async createVocabularyWord(payload: {
        word: string;
        meaning?: string;
        example?: string;
        translation?: string;
    }): Promise<{ id: string; word: string | null }> {
        const response = await this.httpClient.post<{
            id: string;
            word: string | null;
        }>('/vocabulary', payload);
        return response.data;
    }

    public async updateVocabularyWord(
        id: string,
        payload: {
            word?: string;
            meaning?: string;
            example?: string;
            translation?: string;
        },
    ): Promise<void> {
        await this.httpClient.patch(`/vocabulary/${id}`, payload);
    }

    public async createTopicWord(payload: {
        vocabularyId: string;
        topicId: string;
    }): Promise<void> {
        await this.httpClient.post('/vocabulary-topic-words', payload);
    }

    public async removeTopic(id: string): Promise<void> {
        await this.httpClient.delete(`/vocabulary-topics/${id}`);
    }

    public async removeWord(id: string): Promise<void> {
        await this.httpClient.delete(`/vocabulary/${id}`);
    }
}

export const vocabularyService = new VocabularyService();
