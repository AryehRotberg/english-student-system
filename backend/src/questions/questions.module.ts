import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

@Module({
    imports: [AuthModule],
    controllers: [QuestionsController],
    providers: [QuestionsService],
})
export class QuestionsModule { }