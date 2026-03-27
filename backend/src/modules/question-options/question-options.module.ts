import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { QuestionOptionsService } from './question-options.service';
import { QuestionOptionsController } from './question-options.controller';

@Module({
    imports: [AuthModule],
    controllers: [QuestionOptionsController],
    providers: [QuestionOptionsService],
})
export class QuestionOptionsModule {}
