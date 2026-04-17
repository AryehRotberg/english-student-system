import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDate,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { AssignmentItemCreateDto } from '../../assignment-items/dto/assignment-item.create.dto';

export class NestedAssignmentItemDto extends OmitType(AssignmentItemCreateDto, [
    'assignmentId',
] as const) {}

export class AssignmentCreateDto {
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

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NestedAssignmentItemDto)
    @ApiProperty({ type: [NestedAssignmentItemDto] })
    items?: NestedAssignmentItemDto[];
}
