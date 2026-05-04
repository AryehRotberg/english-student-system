import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentAnswer } from './entities/student-answer.entity';
import { StudentAnswersCommon } from './student-answers.common';
import { StudentAnswersController } from './student-answers.controller';
import { StudentAnswersService } from './student-answers.service';
import { StudentAnswerRepository } from './repositories/student-answer.repository';

@Module({
    imports: [TypeOrmModule.forFeature([StudentAnswer])],
    controllers: [StudentAnswersController],
    providers: [StudentAnswersService, StudentAnswersCommon, StudentAnswerRepository],
})
export class StudentAnswersModule {}
