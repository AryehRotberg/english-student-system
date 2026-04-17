import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AiDraftsController } from './ai-drafts.controller';
import { AiDraftsService } from './ai-drafts.service';

@Module({
    imports: [AuthModule, BullModule.registerQueue({ name: 'generate-quiz' })],
    controllers: [AiDraftsController],
    providers: [AiDraftsService],
    exports: [AiDraftsService],
})
export class AiDraftsModule {}
