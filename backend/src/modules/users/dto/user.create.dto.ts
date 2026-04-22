import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class UserCreateDto {
    @IsString()
    @ApiProperty()
    name: string;

    @IsEmail()
    @ApiProperty()
    email: string;

    @IsString()
    @MinLength(8)
    @ApiProperty()
    password: string;

    @IsUUID()
    @ApiProperty()
    teacherId: string;
}
