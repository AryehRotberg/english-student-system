import { PartialType } from '@nestjs/mapped-types';
import { AssignmentItemCreateDto } from './assignment-item.create.dto';

export class UpdateAssignmentItemDto extends PartialType(AssignmentItemCreateDto) {}
