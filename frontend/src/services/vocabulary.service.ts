import type { AxiosInstance } from "axios";
import { httpClientService } from "./http-client.service";
import type { VocabularyTopicApiItem } from "../types/api-items/vocabulary-topic";
import type { VocabularyTopicWordApiItem } from "../types/api-items/vocabulary-topic-word";
import type { VocabularyTopicWithWords } from "../types/vocabulary";

class VocabularyService {
    private readonly httpClient: AxiosInstance;

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

    public async listTopicsWithWords(): Promise<VocabularyTopicWithWords[]> {
        const topics = await this.listTopics();

        const topicWordPairs = await Promise.all(
            topics.map(async (topic) => {
                const words = await this.listTopicWords(topic.id);
                return [topic, words] as const;
            }),
        );

        return topicWordPairs.map(([topic, words]) => ({
            id: topic.id,
            topic: topic.topic?.trim() || "Untitled topic",
            description: topic.description,
            createdAt: topic.createdAt,
            words: words
                .filter((word) => Boolean(word.word?.trim()))
                .map((word) => ({
                    id: word.id,
                    vocabularyId: word.vocabularyId,
                    word: word.word?.trim() || "",
                    meaning: word.meaning,
                    example: word.example,
                    translation: word.translation,
                })),
        }));
    }
}

export const vocabularyService = new VocabularyService();
