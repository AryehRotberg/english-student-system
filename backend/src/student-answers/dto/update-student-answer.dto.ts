import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateStudentAnswerDto {
	@IsOptional()
	@IsObject()
	answerData?: Record<string, unknown>;

	@IsOptional()
	@IsString()
	feedback?: string;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	points?: number;
}
