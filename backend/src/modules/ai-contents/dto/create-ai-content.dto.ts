import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsString, IsUUID } from 'class-validator';

export class CreateAiContentDto {
    @IsString()
    @ApiProperty()
    model: string;

    @IsJSON()
    @ApiProperty()
    content: string;

    @IsString()
    @ApiProperty()
    contentType: string;

    @IsString()
    @ApiProperty()
    additionalInstructions?: string;
}
