import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { AiDraftsController } from './ai-drafts.controller';
import { AiDraftsService } from './ai-drafts.service';
import { AiDraft } from './entities/ai-draft.entity';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([AiDraft]),
        BullModule.registerQueue({ name: 'generate-quiz' }),
    ],
    controllers: [AiDraftsController],
    providers: [AiDraftsService],
    exports: [AiDraftsService],
})
export class AiDraftsModule {}
