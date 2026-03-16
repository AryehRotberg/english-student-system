import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
    imports: [AuthModule],
    controllers: [QuizzesController],
    providers: [QuizzesService],
})
export class QuizzesModule { }
