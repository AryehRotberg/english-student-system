import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsString } from 'class-validator';

export class AiDraftCreateDto {
    @IsString()
    @ApiProperty()
    model: string;

    @IsJSON()
    @ApiProperty()
    draft: string;

    @IsString()
    @ApiProperty()
    draftType: string;

    @IsString()
    @ApiProperty()
    additionalInstructions?: string;
}
