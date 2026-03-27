import { Body, Controller, Post } from '@nestjs/common';
import { AssignmentCompletionEmailDto } from './dto/assignment-completion-email.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendEmailService } from './send-email.service';

@Controller('send-email')
export class SendEmailController {
    constructor(private readonly sendEmailService: SendEmailService) {}

    @Post()
    sendEmail(@Body() sendEmailDto: SendEmailDto) {
        return this.sendEmailService.sendEmail(sendEmailDto);
    }

    @Post('assignment-completion')
    sendAssignmentCompletionEmail(
        @Body() assignmentCompletionEmailDto: AssignmentCompletionEmailDto,
    ) {
        return this.sendEmailService.sendAssignmentCompletionEmail(
            assignmentCompletionEmailDto,
        );
    }
}
