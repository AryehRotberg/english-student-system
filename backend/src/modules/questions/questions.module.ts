import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { Question } from './entities/question.entity';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Question])],
    controllers: [QuestionsController],
    providers: [QuestionsService],
    exports: [QuestionsService],
})
export class QuestionsModule {}
