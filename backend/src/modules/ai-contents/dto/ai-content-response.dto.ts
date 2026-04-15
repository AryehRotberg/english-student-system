import { ApiProperty } from '@nestjs/swagger';
import { AiContent } from '../entities/ai-content';

export class AiContentResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly model: string;
    @ApiProperty()
    readonly content: string;
    @ApiProperty()
    readonly contentType: string;
    @ApiProperty()
    readonly isApproved: boolean;
    @ApiProperty()
    readonly additionalInstructions: string;
    @ApiProperty()
    readonly createdAt: Date;

    private constructor(props: AiContentResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(aiContent: AiContent): AiContentResponseDto {
        return new AiContentResponseDto({
            id: aiContent.id,
            model: aiContent.model,
            content: aiContent.content,
            contentType: aiContent.contentType,
            isApproved: aiContent.isApproved,
            additionalInstructions: aiContent.additionalInstructions,
            createdAt: aiContent.createdAt,
        });
    }

    static fromEntities(aiContents: AiContent[]): AiContentResponseDto[] {
        return aiContents.map(AiContentResponseDto.fromEntity);
    }
}
