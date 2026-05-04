import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { QuestionChoicesController } from './question-choices.controller';
import { QuestionChoicesService } from './question-choices.service';
import { QuestionChoice } from './entities/question-choice.entity';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([QuestionChoice])],
    controllers: [QuestionChoicesController],
    providers: [QuestionChoicesService],
    exports: [QuestionChoicesService],
})
export class QuestionChoicesModule {}
