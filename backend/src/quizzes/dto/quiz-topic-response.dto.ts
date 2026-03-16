import { QuizTopic } from '../entities/quiz-topic.entity';

export class QuizTopicResponseDto {
    readonly id: string;
    readonly topic: string;
    readonly explanation: string;

    private constructor(props: QuizTopicResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(topic: QuizTopic): QuizTopicResponseDto {
        const props: QuizTopicResponseDto = {
            id: topic.id,
            topic: topic.topic,
            explanation: topic.explanation,
        };

        return new QuizTopicResponseDto(props);
    }

    static fromEntities(topics: QuizTopic[]): QuizTopicResponseDto[] {
        return topics.map(QuizTopicResponseDto.fromEntity);
    }
}
