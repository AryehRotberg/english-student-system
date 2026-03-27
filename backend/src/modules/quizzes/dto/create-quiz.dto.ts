import { IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    description?: string;
}
