import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { QuestionAcceptedAnswersController } from './question-accepted-answers.controller';
import { QuestionAcceptedAnswersService } from './question-accepted-answers.service';

@Module({
    imports: [AuthModule],
    controllers: [QuestionAcceptedAnswersController],
    providers: [QuestionAcceptedAnswersService],
    exports: [QuestionAcceptedAnswersService],
})
export class QuestionAcceptedAnswersModule {}
