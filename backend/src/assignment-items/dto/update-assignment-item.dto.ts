import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentItemDto } from './create-assignment-item.dto';

export class UpdateAssignmentItemDto extends PartialType(CreateAssignmentItemDto) {}
