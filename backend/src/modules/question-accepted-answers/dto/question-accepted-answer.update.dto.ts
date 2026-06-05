import { PartialType } from '@nestjs/mapped-types';
import { QuestionAcceptedAnswerCreateDto } from './question-accepted-answer.create.dto';

export class QuestionAcceptedAnswerUpdateDto extends PartialType(
    QuestionAcceptedAnswerCreateDto,
) {}
