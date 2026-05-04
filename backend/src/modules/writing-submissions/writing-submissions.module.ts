import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { WritingSubmission } from './entities/writing-submission.entity';
import { WritingSubmissionsController } from './writing-submissions.controller';
import { WritingSubmissionsService } from './writing-submissions.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([WritingSubmission])],
    controllers: [WritingSubmissionsController],
    providers: [WritingSubmissionsService],
})
export class WritingSubmissionsModule {}
