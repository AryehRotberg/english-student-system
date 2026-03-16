import { IsUUID, IsString } from "class-validator";

export class GetQuizQuestionsFilterDto {
    @IsUUID()
    @IsString()
    quizId: string;
}