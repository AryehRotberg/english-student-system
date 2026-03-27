import { Type } from 'class-transformer';
import { IsDate, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
    @IsUUID()
    @ApiProperty()
    userId: string;

    @IsString()
    @ApiProperty()
    title: string;

    @IsString()
    @ApiProperty()
    description: string;

    @Type(() => Date)
    @IsDate()
    @ApiProperty()
    dueDate: Date;
}
