import { PartialType } from '@nestjs/mapped-types';
import { QuizQuestionCreateDto } from './quiz-question.create.dto';

export class QuizQuestionUpdateDto extends PartialType(QuizQuestionCreateDto) { }