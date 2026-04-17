import { IsBoolean, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionChoiceCreateDto {
	@IsUUID()
	@ApiProperty()
	questionId: string;

	@IsString()
	@ApiProperty()
	optionText: string;

	@IsBoolean()
	@ApiProperty()
	isCorrect: boolean;
}
