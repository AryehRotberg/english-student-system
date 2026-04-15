import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionChoiceDto } from './create-question-choice.dto';

export class UpdateQuestionChoiceDto extends PartialType(CreateQuestionChoiceDto) {}
