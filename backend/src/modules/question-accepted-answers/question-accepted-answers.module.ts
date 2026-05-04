import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { QuestionAcceptedAnswersController } from './question-accepted-answers.controller';
import { QuestionAcceptedAnswersService } from './question-accepted-answers.service';
import { QuestionAcceptedAnswer } from './entities/question-accepted-answer.entity';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([QuestionAcceptedAnswer])],
    controllers: [QuestionAcceptedAnswersController],
    providers: [QuestionAcceptedAnswersService],
    exports: [QuestionAcceptedAnswersService],
})
export class QuestionAcceptedAnswersModule {}
