import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailerService {
    private transporter: nodemailer.Transporter;

    constructor() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error(
                'EMAIL_USER and EMAIL_PASS environment variables must be set',
            );
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendEmail(
        to: string,
        subject: string,
        html: string,
    ): Promise<nodemailer.SentMessageInfo> {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html,
            });
            Logger.log('Email sent: ' + info.response);
            return info;
        } catch (error) {
            Logger.error('Error sending email:', error);
            Sentry.captureException(error);
            throw error;
        }
    }
}
