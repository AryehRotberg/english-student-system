import { IsUUID, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class GetQuizQuestionsFilterDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    quizId: string;
}