import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GenerateQuizDto {
    @ApiProperty({ description: 'The topic of the quiz' })
    @IsString()
    topic: string;

    @ApiPropertyOptional({
        description: 'The number of multiple choice questions',
    })
    @IsOptional()
    @IsNumber()
    multipleChoiceCount: number;

    @ApiPropertyOptional({ description: 'The number of open-ended questions' })
    @IsOptional()
    @IsNumber()
    openEndedCount: number;

    @ApiPropertyOptional({
        description:
            'Additional instructions to guide quiz generation (e.g., focus on a specific subtopic, use a certain style, etc.)',
    })
    @IsOptional()
    @IsString()
    additionalInstructions?: string;
}
