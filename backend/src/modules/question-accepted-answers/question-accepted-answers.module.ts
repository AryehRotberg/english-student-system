import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { QuestionAcceptedAnswersService } from './question-accepted-answers.service';
import { QuestionAcceptedAnswersController } from './question-accepted-answers.controller';

@Module({
    imports: [AuthModule],
    controllers: [QuestionAcceptedAnswersController],
    providers: [QuestionAcceptedAnswersService],
})
export class QuestionAcceptedAnswersModule {}
