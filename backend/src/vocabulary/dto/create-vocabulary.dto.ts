import { IsOptional, IsString } from 'class-validator';

export class CreateVocabularyDto {
    @IsOptional()
    @IsString()
    word?: string;

    @IsOptional()
    @IsString()
    meaning?: string;

    @IsOptional()
    @IsString()
    example?: string;

    @IsOptional()
    @IsString()
    translation?: string;
}
