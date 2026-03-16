import { IsUUID, IsString } from 'class-validator';

export class GetQuestionOptionsFilterDto {
    @IsUUID()
    @IsString()
    questionId: string;
}