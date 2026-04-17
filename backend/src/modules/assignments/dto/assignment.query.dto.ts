import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentQueryDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    userId: string;
}
