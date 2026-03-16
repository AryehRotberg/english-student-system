import { IsString } from 'class-validator';

export class CreateTextDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsString()
    level: string;
}