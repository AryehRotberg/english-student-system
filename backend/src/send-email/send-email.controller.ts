import {
    Body,
    Controller,
    Post
} from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { SendEmailService } from './send-email.service';

@Controller('send-email')
export class SendEmailController {
    constructor(private readonly sendEmailService: SendEmailService) {}

    @Post()
    sendEmail(@Body() sendEmailDto: SendEmailDto) {
        return this.sendEmailService.sendEmail(sendEmailDto);
    }
}
