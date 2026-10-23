export type VocabularyWord = {
    id: string;
    vocabularyId: string;
    word: string;
    meaning: string | null;
    example: string | null;
    translation: string | null;
};

// One word for POST /vocabulary-topic-words/import, in the shape of a vocabulary
// JSON file.
export type VocabularyImportWord = {
    word: string;
    word_sound?: string;
    meaning?: string;
    example?: string;
    translation?: string;
};

export type VocabularyTopicPreview = {
    id: string;
    topic: string;
    description: string | null;
    createdAt: string;
};

export type VocabularyTopicWithWords = {
    id: string;
    topic: string;
    description: string | null;
    createdAt: string;
    words: VocabularyWord[];
};
