import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetQuestionChoicesFilterDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    questionId: string;
}