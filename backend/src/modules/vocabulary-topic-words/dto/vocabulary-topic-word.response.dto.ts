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

    private constructor(props: VocabularyTopicWord) {
        this.id = props.id;
        this.vocabularyId = props.vocabularyId;
        this.topicId = props.topicId;
        this.word = props.word;
        this.meaning = props.meaning;
        this.example = props.example;
        this.translation = props.translation;
        this.topic = props.topic;
        this.createdAt = props.createdAt;
    }

    static fromEntity(
        topicWord: VocabularyTopicWord,
    ): VocabularyTopicWordResponseDto {
        return new VocabularyTopicWordResponseDto(topicWord);
    }

    static fromEntities(
        topicWords: VocabularyTopicWord[],
    ): VocabularyTopicWordResponseDto[] {
        return topicWords.map(VocabularyTopicWordResponseDto.fromEntity);
    }
}
