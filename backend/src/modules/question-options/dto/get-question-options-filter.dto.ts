import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetQuestionOptionsFilterDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    questionId: string;
}