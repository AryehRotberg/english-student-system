import { Module } from '@nestjs/common';
import { StudentAnswersService } from './student-answers.service';
import { StudentAnswersController } from './student-answers.controller';

@Module({
    controllers: [StudentAnswersController],
    providers: [StudentAnswersService],
})
export class StudentAnswersModule { }
