import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { QuestionChoicesController } from './question-choices.controller';
import { QuestionChoicesService } from './question-choices.service';

@Module({
    imports: [AuthModule],
    controllers: [QuestionChoicesController],
    providers: [QuestionChoicesService],
    exports: [QuestionChoicesService],
})
export class QuestionChoicesModule {}
