import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateQuizAttemptDto {
	@IsUUID()
	quizId: string;

	@IsUUID()
	userId: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	points?: number;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	startedAt?: Date;

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	completedAt?: Date | null;
}
