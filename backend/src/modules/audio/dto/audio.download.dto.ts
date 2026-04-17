import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AudioDownloadDto {
    @IsString()
    @ApiProperty()
    bucket: string;

    @IsString()
    @ApiProperty()
    path: string;
}
