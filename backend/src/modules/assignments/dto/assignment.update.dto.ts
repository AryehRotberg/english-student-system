import { PartialType } from '@nestjs/mapped-types';
import { AssignmentCreateDto } from './assignment.create.dto';

export class AssignmentUpdateDto extends PartialType(AssignmentCreateDto) {}
