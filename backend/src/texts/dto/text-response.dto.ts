import { Text } from '../entities/text.entity';

export class TextResponseDto {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly level: string;
    readonly createdAt: Date;

    private constructor(props: TextResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(text: Text): TextResponseDto {
        return new TextResponseDto({
            id: text.id,
            title: text.title,
            content: text.content,
            level: text.level,
            createdAt: text.createdAt,
        });
    }

    static fromEntities(texts: Text[]): TextResponseDto[] {
        return texts.map(TextResponseDto.fromEntity);
    }
}