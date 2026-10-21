// ========== Nodemailer Service unit tests
import { MailerService } from '@nestjs-modules/mailer';
import { NodemailerService } from './nodemailer.service';

const sendMail = jest.fn();

const buildService = () =>
	new NodemailerService({ sendMail } as unknown as MailerService);

beforeEach(() => {
	sendMail.mockReset().mockResolvedValue({ messageId: 'queued' });
});

describe('NodemailerService', () => {
	it('sends the reset-password email through the forgot-password template', async () => {
		const service = buildService();

		const result = await service.sendEmail(
			'a@b.c',
			'no-reply@example.com',
			'http://localhost:3000/forgot?token=tok',
		);

		expect(result).toEqual({ messageId: 'queued' });
		expect(sendMail).toHaveBeenCalledTimes(1);
		expect(sendMail).toHaveBeenCalledWith({
			to: 'a@b.c',
			from: 'no-reply@example.com',
			subject: 'Reset Password Link',
			template: 'forgot-password',
			context: { link: 'http://localhost:3000/forgot?token=tok' },
		});
	});
});
