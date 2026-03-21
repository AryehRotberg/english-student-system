import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpsertStudentAnswerDto {
	@IsUUID()
	attemptId: string;

	@IsUUID()
	questionId: string;

	@IsObject()
	answerData: Record<string, unknown>;

	@IsOptional()
	@IsString()
	feedback?: string;
}
