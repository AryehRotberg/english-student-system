import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAssignmentsFilterDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    userId: string;
}
