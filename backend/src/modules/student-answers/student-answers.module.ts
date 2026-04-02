import { Module } from '@nestjs/common';
import { StudentAnswersCommon } from './student-answers.common';
import { StudentAnswersController } from './student-answers.controller';
import { StudentAnswersService } from './student-answers.service';

@Module({
    controllers: [StudentAnswersController],
    providers: [StudentAnswersService, StudentAnswersCommon],
})
export class StudentAnswersModule {}
