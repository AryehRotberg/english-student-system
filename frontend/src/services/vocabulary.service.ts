import type { AxiosInstance } from "axios";
import type { VocabularyTopicApiItem } from "../types/api-items/vocabulary-topic";
import type { VocabularyTopicWordApiItem } from "../types/api-items/vocabulary-topic-word";
import type {
    VocabularyTopicPreview,
    VocabularyTopicWithWords,
    VocabularyWord,
} from "../types/vocabulary";
import { httpClientService } from "./http-client.service";

class VocabularyService {
    private readonly httpClient: AxiosInstance;

    private toTopicPreview(
        topic: VocabularyTopicApiItem,
    ): VocabularyTopicPreview {
        return {
            id: topic.id,
            topic: topic.topic?.trim() || "Untitled topic",
            description: topic.description,
            createdAt: topic.createdAt,
        };
    }

    private toVocabularyWord(word: VocabularyTopicWordApiItem): VocabularyWord {
        return {
            id: word.id,
            vocabularyId: word.vocabularyId,
            word: word.word?.trim() || "",
            meaning: word.meaning,
            example: word.example,
            translation: word.translation,
        };
    }

    constructor() {
        this.httpClient = httpClientService.getInstance();
    }

    public async listTopics(): Promise<VocabularyTopicApiItem[]> {
        const response =
            await this.httpClient.get<VocabularyTopicApiItem[]>(
                "/vocabulary-topics",
            );
        return Array.isArray(response.data) ? response.data : [];
    }

    public async listTopicWords(
        topicId: string,
    ): Promise<VocabularyTopicWordApiItem[]> {
        const response = await this.httpClient.get<
            VocabularyTopicWordApiItem[]
        >(`/vocabulary-topic-words?topicId=${topicId}`);
        return Array.isArray(response.data) ? response.data : [];
    }

    public async listTopicsPreview(): Promise<VocabularyTopicPreview[]> {
        const topics = await this.listTopics();
        return topics.map((topic) => this.toTopicPreview(topic));
    }

    public async listWordsForTopic(topicId: string): Promise<VocabularyWord[]> {
        const words = await this.listTopicWords(topicId);

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
}

export const vocabularyService = new VocabularyService();
