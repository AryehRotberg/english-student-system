import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWritingTaskDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @ApiProperty()
    instructions: string;

    @Type(() => Number)
    @IsNumber()
    @ApiProperty()
    minWords: number;
}