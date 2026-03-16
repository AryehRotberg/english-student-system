import { IsUUID, IsString } from "class-validator";

export class GetAssignmentItemsFilterDto {
    @IsUUID()
    @IsString()
    userId: string;
}