import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { QuestionChoicesService } from './question-choices.service';
import { QuestionChoicesController } from './question-choices.controller';

@Module({
    imports: [AuthModule],
    controllers: [QuestionChoicesController],
    providers: [QuestionChoicesService],
})
export class QuestionChoicesModule {}
