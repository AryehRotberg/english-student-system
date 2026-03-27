import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { WritingSubmissionsController } from './writing-submissions.controller';
import { WritingSubmissionsService } from './writing-submissions.service';

@Module({
    imports: [AuthModule],
    controllers: [WritingSubmissionsController],
    providers: [WritingSubmissionsService],
})
export class WritingSubmissionsModule {}
