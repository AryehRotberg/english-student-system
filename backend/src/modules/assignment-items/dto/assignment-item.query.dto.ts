import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentItemQueryDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    userId: string;
}
