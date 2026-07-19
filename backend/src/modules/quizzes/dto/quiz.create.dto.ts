import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsIn,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class QuizCreateDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    description?: string;
}

class QuizAnswerDto {
    @IsString()
    text: string;

    @IsInt()
    blankIndex: number;
}

class QuizOptionDto {
    @IsString()
    text: string;

    @IsBoolean()
    isCorrect: boolean;
}

class QuizQuestionItemDto {
    @IsString()
    question: string;

    @IsIn(['multiple_choice', 'open_ended'])
    question_type: 'multiple_choice' | 'open_ended';

    @IsNumber()
    maxPoints: number;

    @IsNumber()
    difficulty_score: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizAnswerDto)
    answers?: QuizAnswerDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizOptionDto)
    options?: QuizOptionDto[];
}

export class QuizAiDraftCreateDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizQuestionItemDto)
    questions: QuizQuestionItemDto[];
}
