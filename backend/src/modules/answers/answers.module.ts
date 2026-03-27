import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';

@Module({
    imports: [AuthModule],
    controllers: [AnswersController],
    providers: [AnswersService],
})
export class AnswersModule {}
