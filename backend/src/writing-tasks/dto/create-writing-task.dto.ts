import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateWritingTaskDto {
    @IsString()
    title: string;

    @IsString()
    instructions: string;

    @Type(() => Number)
    @IsNumber()
    minWords: number;
}