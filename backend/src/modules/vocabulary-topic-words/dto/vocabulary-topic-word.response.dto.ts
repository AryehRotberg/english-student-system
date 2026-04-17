import { ApiProperty } from '@nestjs/swagger';

interface VocabularyTopicWord {
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

export class VocabularyTopicWordResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly vocabularyId: string;
    @ApiProperty()
    readonly topicId: string;
    @ApiProperty()
    readonly word: string | null;
    @ApiProperty()
    readonly meaning: string | null;
    @ApiProperty()
    readonly example: string | null;
    @ApiProperty()
    readonly translation: string | null;
    @ApiProperty()
    readonly topic: string | null;
    @ApiProperty()
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
