import { PartialType } from '@nestjs/mapped-types';
import { QuestionChoiceCreateDto } from './question-choice.create.dto';

export class QuestionChoiceUpdateDto extends PartialType(QuestionChoiceCreateDto) {}
