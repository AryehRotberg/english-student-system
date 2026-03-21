import { IsString, IsEmail } from 'class-validator';

export class SendEmailDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    subject: string;

    @IsString()
    title: string;

    @IsString()
    body: string;
}
