import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QuizCreateDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    description?: string;
}

export class QuizAiDraftCreateDto {
    title: string;
    description?: string;
    questions: Array<{
        question: string;
        question_type: 'multiple_choice' | 'open_ended';
        maxPoints: number;
        difficulty_score: number;
        answers?: Array<{ text: string; blankIndex: number }>;
        options?: Array<{ text: string; isCorrect: boolean }>;
    }>;
}
