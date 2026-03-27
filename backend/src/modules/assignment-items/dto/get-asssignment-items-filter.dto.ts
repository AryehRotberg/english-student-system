import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAssignmentItemsFilterDto {
    @IsUUID()
    @IsString()
    @ApiProperty()
    userId: string;
}
