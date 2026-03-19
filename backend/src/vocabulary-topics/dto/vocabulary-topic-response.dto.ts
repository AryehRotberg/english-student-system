import { VocabularyTopic } from '../entities/vocabulary-topic.entity';

export class VocabularyTopicResponseDto {
    readonly id: string;
    readonly topic: string | null;
    readonly description: string | null;
    readonly createdAt: Date;

    private constructor(props: VocabularyTopicResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(topic: VocabularyTopic): VocabularyTopicResponseDto {
        return new VocabularyTopicResponseDto({
            id: topic.id,
            topic: topic.topic,
            description: topic.description,
            createdAt: topic.createdAt,
        });
    }

    static fromEntities(
        topics: VocabularyTopic[],
    ): VocabularyTopicResponseDto[] {
        return topics.map(VocabularyTopicResponseDto.fromEntity);
    }
}
