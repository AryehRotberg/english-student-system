import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { NodemailerService } from '../../config/nodemailer';
import { SendEmailService } from './send-email.service';

@Module({
    imports: [ConfigModule],
    providers: [SendEmailService, NodemailerService],
    exports: [SendEmailService],
})
export class SendEmailModule {}
