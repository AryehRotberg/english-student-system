import { IsOptional, IsString } from 'class-validator';

export class CreateVocabularyTopicDto {
    @IsOptional()
    @IsString()
    topic?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
