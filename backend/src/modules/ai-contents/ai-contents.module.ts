import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AiContentsController } from './ai-contents.controller';
import { AiContentsService } from './ai-contents.service';

@Module({
    imports: [
        AuthModule,
        BullModule.registerQueue(
            { name: 'generate-quiz' },
            { name: 'publish-quiz' },
        ),
    ],
    controllers: [AiContentsController],
    providers: [AiContentsService],
    exports: [AiContentsService],
})
export class AiContentsModule {}
