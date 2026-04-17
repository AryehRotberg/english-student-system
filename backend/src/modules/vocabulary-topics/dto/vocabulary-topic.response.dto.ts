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
}
