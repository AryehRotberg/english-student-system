import { VocabularyTopic } from '../entities/vocabulary-topic.entity';
import { ApiProperty } from '@nestjs/swagger';

export class VocabularyTopicResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly topic: string | null;
    @ApiProperty()
    readonly description: string | null;
    @ApiProperty()
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
