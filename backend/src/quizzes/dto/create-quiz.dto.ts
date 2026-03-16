import { IsOptional, IsString } from "class-validator";

export class CreateQuizDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;
}
