import { IsString, IsEmail } from 'class-validator';

export class SendEmailDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    assignment: string;

    @IsString()
    description: string;
}
