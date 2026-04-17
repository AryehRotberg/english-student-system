import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '../../auth/decorators/user.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { UserResponseDto } from '../users/dto/user.response.dto';
import { AssignmentCompletionEmailService } from './assignment-completion-email.service';
import { SendEmailAssignmentCompletionDto } from './dto/send-email.assignment-completion.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { SendEmailService } from './send-email.service';

@Controller('send-email')
export class SendEmailController {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly assignmentCompletionEmailService: AssignmentCompletionEmailService,
    ) {}

    @Post()
    sendEmail(@Body() dto: SendEmailDto) {
        return this.sendEmailService.sendFromDto(dto);
    }

    @Post('assignment-completion')
    @UseGuards(AuthGuard)
    sendAssignmentCompletionEmail(
        @User() user: UserResponseDto,
        @Body() dto: SendEmailAssignmentCompletionDto,
    ) {
        return this.assignmentCompletionEmailService.send(user, dto);
    }
}
