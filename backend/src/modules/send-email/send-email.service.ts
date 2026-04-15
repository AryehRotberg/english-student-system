import { Injectable } from '@nestjs/common';
import { NodemailerService } from '../../config/nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import { escapeHtml } from './send-email.utils';
import { defaultTemplate } from './templates/default-template.template';

@Injectable()
export class SendEmailService {
    constructor(private readonly nodemailerService: NodemailerService) {
        if (!process.env.FRONTEND_URL) {
            throw new Error('FRONTEND_URL environment variable is not set');
        }
    }

    async send(to: string, subject: string, html: string) {
        return await this.nodemailerService.sendEmail(to, subject, html);
    }

    async sendFromDto(sendEmailDto: SendEmailDto) {
        const { email, subject, title, body } = sendEmailDto;

        const safeTitle = escapeHtml(title);
        const safeBody = escapeHtml(body)
            .replace(/\r\n|\r|\n/g, '<br/>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        const portalUrl = process.env.FRONTEND_URL!;

        const html = defaultTemplate(
            { title: safeTitle, body: safeBody },
            portalUrl,
        );
        return await this.send(email, subject, html);
    }
}
