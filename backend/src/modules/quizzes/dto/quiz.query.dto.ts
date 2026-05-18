import { IsEnum, IsOptional } from 'class-validator';
import { ProficiencyLevel, QuizCategory } from '../entities/quiz.entity';

export class QuizQueryDto {
    @IsOptional()
    @IsEnum(QuizCategory)
    category?: QuizCategory;

    @IsOptional()
    @IsEnum(ProficiencyLevel)
    level?: ProficiencyLevel;
}
