import { IsString, IsUUID } from "class-validator";

export class GetQuizAttemptsFilterDto {
    @IsUUID()
    @IsString()
    userId: string;

    @IsUUID()
    @IsString()
    quizId: string;
}