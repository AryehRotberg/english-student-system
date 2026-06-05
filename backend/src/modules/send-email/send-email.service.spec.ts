import { Test, TestingModule } from '@nestjs/testing';
import { NodemailerService } from '../../config/nodemailer';
import { SendEmailService } from './send-email.service';

jest.mock('../../config/nodemailer');

const mockNodemailerService = {
    sendEmail: jest.fn(),
};

describe('SendEmailService', () => {
    let service: SendEmailService;

    beforeEach(async () => {
        process.env.FRONTEND_URL = 'https://example.com';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SendEmailService,
                {
                    provide: NodemailerService,
                    useValue: mockNodemailerService,
                },
            ],
        }).compile();

        service = module.get<SendEmailService>(SendEmailService);
        jest.clearAllMocks();
    });

    afterEach(() => {
        delete process.env.FRONTEND_URL;
    });

    describe('constructor', () => {
        it('should throw when FRONTEND_URL is not set', () => {
            delete process.env.FRONTEND_URL;
            expect(
                () => new SendEmailService(mockNodemailerService as any),
            ).toThrow('FRONTEND_URL environment variable is not set');
        });
    });

    describe('send', () => {
        it('should escape HTML in title and body and call nodemailerService.sendEmail', async () => {
            mockNodemailerService.sendEmail.mockResolvedValue({
                messageId: 'msg-1',
            });

            await service.send(
                'recipient@example.com',
                'Test Subject',
                '<Title>',
                '<Body>',
            );

            expect(mockNodemailerService.sendEmail).toHaveBeenCalledTimes(1);
            const [to, subject, html] =
                mockNodemailerService.sendEmail.mock.calls[0];
            expect(to).toBe('recipient@example.com');
            expect(subject).toBe('Test Subject');
            expect(html).toContain('&lt;Title&gt;');
            expect(html).toContain('&lt;Body&gt;');
        });

        it('should convert newlines to <br/> in the body', async () => {
            mockNodemailerService.sendEmail.mockResolvedValue({});

            await service.send(
                'to@example.com',
                'Subject',
                'Title',
                'line1\nline2',
            );

            const html = mockNodemailerService.sendEmail.mock.calls[0][2];
            expect(html).toContain('line1<br/>line2');
        });

        it('should convert tabs to non-breaking spaces in the body', async () => {
            mockNodemailerService.sendEmail.mockResolvedValue({});

            await service.send(
                'to@example.com',
                'Subject',
                'Title',
                'col1\tcol2',
            );

            const html = mockNodemailerService.sendEmail.mock.calls[0][2];
            expect(html).toContain('col1&nbsp;&nbsp;&nbsp;&nbsp;col2');
        });

        it('should include the portalUrl from FRONTEND_URL in the email HTML', async () => {
            mockNodemailerService.sendEmail.mockResolvedValue({});

            await service.send('to@example.com', 'Subject', 'Title', 'Body');

            const html = mockNodemailerService.sendEmail.mock.calls[0][2];
            expect(html).toContain('https://example.com');
        });

        it('should return the result from nodemailerService.sendEmail', async () => {
            const sentInfo = { messageId: 'msg-123' };
            mockNodemailerService.sendEmail.mockResolvedValue(sentInfo);

            const result = await service.send(
                'to@example.com',
                'Subject',
                'Title',
                'Body',
            );

            expect(result).toEqual(sentInfo);
        });
    });
});
