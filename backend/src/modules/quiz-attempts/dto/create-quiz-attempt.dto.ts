import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizAttemptDto {
	@IsUUID()
	@ApiProperty()
	quizId: string;

	@IsUUID()
	@ApiProperty()
	userId: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@ApiPropertyOptional()
	points?: number;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@ApiPropertyOptional()
	startedAt?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@ApiPropertyOptional()
	completedAt?: Date | null;
}
