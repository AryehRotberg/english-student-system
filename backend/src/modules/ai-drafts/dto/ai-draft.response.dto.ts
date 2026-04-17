import { ApiProperty } from '@nestjs/swagger';

export class AiDraftResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly model: string;
    @ApiProperty()
    readonly draft: string;
    @ApiProperty()
    readonly draftType: string;
    @ApiProperty()
    readonly isApproved: boolean;
    @ApiProperty()
    readonly additionalInstructions: string;
    @ApiProperty()
    readonly createdAt: Date;
}
