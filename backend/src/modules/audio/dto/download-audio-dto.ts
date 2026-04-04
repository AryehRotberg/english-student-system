import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DownloadAudioDto {
    @IsString()
    @ApiProperty()
    bucket: string;

    @IsString()
    @ApiProperty()
    path: string;
}
