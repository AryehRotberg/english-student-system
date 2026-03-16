import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateQuestionDto {
    @IsString()
    question: string;

    @IsString()
    questionType: string;

    @IsOptional()
    @IsUrl()
    audioUrl?: string;
}