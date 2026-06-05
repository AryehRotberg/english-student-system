import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, ValidateIf } from 'class-validator';

export class StudentAnswerUpsertDto {
    @IsUUID()
    @ApiProperty()
    attemptId: string;

    @IsUUID()
    @ApiProperty()
    questionId: string;

    @ValidateIf((o) => !o.textAnswers || o.textAnswers.length === 0)
    @IsUUID()
    @ApiPropertyOptional()
    selectedOptionId?: string;

    @ValidateIf((o) => !o.selectedOptionId)
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({
        description: 'Array of strings for fill-in-the-blanks',
    })
    textAnswers?: string[];
}
