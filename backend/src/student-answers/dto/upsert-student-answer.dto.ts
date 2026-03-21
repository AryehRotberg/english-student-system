import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertStudentAnswerDto {
	@IsUUID()
	@ApiProperty()
	attemptId: string;

	@IsUUID()
	@ApiProperty()
	questionId: string;

	@IsObject()
	@ApiProperty()
	answerData: Record<string, unknown>;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional()
	feedback?: string;
}
