export class VocabularyTopicWord {
    id: string;
    vocabularyId: string;
    topicId: string;
    word: string | null;
    meaning: string | null;
    example: string | null;
    translation: string | null;
    topic: string | null;
    createdAt: Date;
}
