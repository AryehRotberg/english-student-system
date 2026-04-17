import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuizCreateDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    description?: string;
}
