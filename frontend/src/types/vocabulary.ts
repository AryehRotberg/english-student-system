export type VocabularyWord = {
    id: string;
    vocabularyId: string;
    word: string;
    meaning: string | null;
    example: string | null;
    translation: string | null;
};

export type VocabularyTopicWithWords = {
    id: string;
    topic: string;
    description: string | null;
    createdAt: string;
    words: VocabularyWord[];
};
