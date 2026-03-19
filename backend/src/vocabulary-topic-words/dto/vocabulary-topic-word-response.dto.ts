import { VocabularyTopicWord } from '../entities/vocabulary-topic-word.entity';

export class VocabularyTopicWordResponseDto {
    readonly id: string;
    readonly vocabularyId: string;
    readonly topicId: string;
    readonly word: string | null;
    readonly meaning: string | null;
    readonly example: string | null;
    readonly translation: string | null;
    readonly topic: string | null;
    readonly createdAt: Date;

    private constructor(props: VocabularyTopicWordResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(
        topicWord: VocabularyTopicWord,
    ): VocabularyTopicWordResponseDto {
        return new VocabularyTopicWordResponseDto({
            id: topicWord.id,
            vocabularyId: topicWord.vocabularyId,
            topicId: topicWord.topicId,
            word: topicWord.word,
            meaning: topicWord.meaning,
            example: topicWord.example,
            translation: topicWord.translation,
            topic: topicWord.topic,
            createdAt: topicWord.createdAt,
        });
    }

    static fromEntities(
        topicWords: VocabularyTopicWord[],
    ): VocabularyTopicWordResponseDto[] {
        return topicWords.map(VocabularyTopicWordResponseDto.fromEntity);
    }
}
