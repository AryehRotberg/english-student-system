import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AiDraftGenerateQuizDto {
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
            'The target proficiency level of the quiz audience (e.g., "Beginner (CEFR A1/A2)", "Intermediate (CEFR B1/B2)", "Advanced (CEFR C1/C2)")',
    })
    @IsString()
    targetLevel: string;

    @ApiPropertyOptional({
        description:
            'Additional instructions to guide quiz generation (e.g., focus on a specific subtopic, use a certain style, etc.)',
    })
    @IsOptional()
    @IsString()
    additionalInstructions?: string;
}
