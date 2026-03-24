import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}
