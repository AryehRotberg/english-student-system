import { Type } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateAnswerDto {
	@IsUUID()
	questionId: string;

	@IsString()
	answer: string;

	@Type(() => Number)
	@IsNumber()
	blankIndex: number;
}
