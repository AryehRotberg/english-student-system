import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @IsString()
    @MinLength(8)
    @ApiProperty({ minLength: 8 })
    newPassword: string;
}
