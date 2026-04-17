import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsOptional,
    IsString,
    IsUUID
} from 'class-validator';

export class StudentAnswerUpsertDto {
    @IsUUID()
    @ApiProperty()
    attemptId: string;

    @IsUUID()
    @ApiProperty()
    questionId: string;

    @IsOptional()
    @IsUUID()
    @ApiPropertyOptional()
    selectedOptionId?: string;

    @ApiProperty({
        example: ['were', 'sleeping'],
        required: false,
        description: 'Array of strings for fill-in-the-blanks',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    textAnswers?: string[];
}
