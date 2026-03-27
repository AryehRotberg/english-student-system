import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsString, IsUUID } from 'class-validator';

export class CreateAiContentDto {
    @IsJSON()
    @ApiProperty()
    content: string;

    @IsString()
    @ApiProperty()
    contentType: string;
}
