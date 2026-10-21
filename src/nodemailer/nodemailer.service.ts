// ========== Nodemailer Service
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NodemailerService {
	constructor(private readonly mailerService: MailerService) {}

	/**
	 * Sends the reset-password email by rendering the `forgot-password`
	 * Handlebars template with the reset link.
	 */
	public async sendEmail(to: string, from: string, link: string) {
		return this.mailerService.sendMail({
			to,
			from,
			subject: 'Reset Password Link',
			template: 'forgot-password',
			context: { link },
		});
	}
}
