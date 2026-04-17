import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TextCreateDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @ApiProperty()
    content: string;

    @IsString()
    @ApiProperty()
    level: string;
}