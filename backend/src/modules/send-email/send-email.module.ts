import { Module } from '@nestjs/common';
import { SendEmailService } from './send-email.service';
import { SendEmailController } from './send-email.controller';
import { ConfigModule } from '../../config/config.module';

@Module({
    imports: [ConfigModule],
    controllers: [SendEmailController],
    providers: [SendEmailService],
    exports: [SendEmailService],
})
export class SendEmailModule {}
