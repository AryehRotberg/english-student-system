import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ConfigModule } from '../../config/config.module';
import { AssignmentCompletionEmailService } from './assignment-completion-email.service';
import { SendEmailRepository } from './repositories/send-email.repository';
import { SendEmailController } from './send-email.controller';
import { SendEmailService } from './send-email.service';

@Module({
    imports: [ConfigModule, AuthModule],
    controllers: [SendEmailController],
    providers: [
        SendEmailService,
        AssignmentCompletionEmailService,
        SendEmailRepository,
    ],
    exports: [SendEmailService],
})
export class SendEmailModule {}
