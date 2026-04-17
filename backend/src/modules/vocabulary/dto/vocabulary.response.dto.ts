import { ApiProperty } from '@nestjs/swagger';

export class VocabularyResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly word: string | null;
    @ApiProperty()
    readonly meaning: string | null;
    @ApiProperty()
    readonly example: string | null;
    @ApiProperty()
    readonly translation: string | null;
    @ApiProperty()
    readonly createdAt: Date;
}
