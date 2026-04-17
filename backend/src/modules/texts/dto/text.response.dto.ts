import { ApiProperty } from '@nestjs/swagger';

interface Text {
    id: string;
    title: string;
    content: string;
    level: string;
    createdAt: Date;
}

export class TextResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly title: string;
    @ApiProperty()
    readonly content: string;
    @ApiProperty()
    readonly level: string;
    @ApiProperty()
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