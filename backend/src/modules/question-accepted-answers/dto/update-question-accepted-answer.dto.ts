import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionAcceptedAnswerDto } from './create-question-accepted-answer.dto';

export class UpdateQuestionAcceptedAnswerDto extends PartialType(CreateQuestionAcceptedAnswerDto) {}
