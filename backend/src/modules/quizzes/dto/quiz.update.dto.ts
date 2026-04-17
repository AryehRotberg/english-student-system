import { PartialType } from '@nestjs/mapped-types';
import { QuizCreateDto } from './quiz.create.dto';

export class QuizUpdateDto extends PartialType(QuizCreateDto) {}
