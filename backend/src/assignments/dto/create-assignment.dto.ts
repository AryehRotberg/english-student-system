import { Type } from 'class-transformer';
import { IsDate, IsString, IsUUID } from 'class-validator';

export class CreateAssignmentDto {
    @IsUUID()
    userId: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @Type(() => Date)
    @IsDate()
    dueDate: Date;
}