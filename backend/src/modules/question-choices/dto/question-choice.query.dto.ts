import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuestionChoiceQueryDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    questionId: string;
}
