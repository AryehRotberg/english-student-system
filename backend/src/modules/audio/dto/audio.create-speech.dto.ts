import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AudioCreateSpeechDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    text: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    voiceId?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false })
    speed?: number;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    bucket?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false })
    path?: string;
}
