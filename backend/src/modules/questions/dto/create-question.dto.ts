import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateQuestionDto {
    @IsString()
    @ApiProperty()
    question: string;

    @IsString()
    @ApiProperty()
    questionType: string;
}
