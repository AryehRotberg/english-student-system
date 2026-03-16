import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class CreateQuestionOptionDto {
	@IsUUID()
	questionId: string;

	@IsString()
	optionText: string;

	@IsBoolean()
	isCorrect: boolean;
}
