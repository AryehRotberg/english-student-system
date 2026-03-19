import { Injectable } from '@nestjs/common';
import { NodemailerService } from 'src/config/nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import { htmlBody } from './templates/html-body.template';

@Injectable()
export class SendEmailService {
    constructor(private readonly nodemailerService: NodemailerService) {
        if (!process.env.FRONTEND_URL) {
            throw new Error('FRONTEND_URL environment variable is not set');
        }
    }

    async sendEmail(sendEmailDto: SendEmailDto) {
        const { name, email, assignment, description } = sendEmailDto;

        const safeAssignment = this.escapeHtml(assignment);
        const safeDescription = this.escapeHtml(description)
            .replace(/\r\n|\r|\n/g, '<br/>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

        const renderedHtml = htmlBody({
            studentName: name,
            assignment: safeAssignment,
            description: safeDescription,
            portalUrl: process.env.FRONTEND_URL!,
        });

        return await this.nodemailerService.sendEmail(
            email,
            `New Assignment: ${assignment}`,
            renderedHtml,
        );
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
