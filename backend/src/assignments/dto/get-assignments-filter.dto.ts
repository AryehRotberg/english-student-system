import { IsString, IsUUID } from 'class-validator';

export class GetAssignmentsFilterDto {
    @IsUUID()
    @IsString()
    userId: string;
}
