import { Injectable } from '@nestjs/common';
import { NodemailerService } from '../../config/nodemailer';
import { escapeHtml } from './send-email.utils';
import { defaultTemplate } from './templates/default-template.template';

@Injectable()
export class SendEmailService {
    constructor(private readonly nodemailerService: NodemailerService) {
        if (!process.env.FRONTEND_URL) {
            throw new Error('FRONTEND_URL environment variable is not set');
        }
    }

    async send(
        to: string,
        subject: string,
        title: string,
        body: string,
        cards = '',
    ) {
        const safeTitle = escapeHtml(title);
        const safeBody = escapeHtml(body)
            .replace(/\r\n|\r|\n/g, '<br/>')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        const portalUrl = process.env.FRONTEND_URL!;

        const html = defaultTemplate(
            { title: safeTitle, body: safeBody, cards },
            portalUrl,
        );
        return await this.nodemailerService.sendEmail(to, subject, html);
    }
}
