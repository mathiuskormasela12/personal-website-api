// ========== User Service unit tests
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { ResponseService } from 'src/response/response.service';
import { User } from './user.entity';

const req: any = { url: 'http://localhost:3000/users' };

const configValues = {
	SECRET_KEY: 'forgot-secret',
	WEB_HOSTNAME: 'http://localhost:3000',
	EMAIL: 'no-reply@example.com',
};

const configService = {
	get: jest.fn((key: string) => configValues[key]),
} as unknown as ConfigService;

const jwtService = {
	sign: jest.fn(() => 'forgot-token'),
} as unknown as JwtService;

const nodemailerService = {
	sendEmail: jest.fn(),
} as unknown as NodemailerService;

const usersRepository = {
	findOne: jest.fn(),
	findByPk: jest.fn(),
	update: jest.fn(),
} as unknown as typeof User;

const buildService = () =>
	new UserService(
		new ResponseService(configService),
		{} as any, // UploadService is not used by the password flows
		nodemailerService,
		configService,
		jwtService,
		usersRepository,
	);

beforeEach(() => {
	jest.clearAllMocks();
	(usersRepository.findOne as jest.Mock).mockReset();
	(usersRepository.findByPk as jest.Mock).mockReset();
	(usersRepository.update as jest.Mock).mockReset();
});

/** Services signal both success and failure by throwing HttpExceptions; unwrap the payload. */
async function httpBody(promise: Promise<unknown>) {
	try {
		return await promise;
	} catch (err: any) {
		return err.response ?? err;
	}
}

describe('UserService', () => {
	describe('forgotPassword', () => {
		it('rejects an email that does not exist', async () => {
			const service = buildService();
			(usersRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(
				httpBody(service.forgotPassword(req, { email: 'ghost@b.c' } as any)),
			).resolves.toMatchObject({
				status: HttpStatus.BAD_REQUEST,
				message: 'The email does not exist',
			});
		});

		it('emails a reset link for an existing email', async () => {
			const service = buildService();
			(usersRepository.findOne as jest.Mock).mockResolvedValue({
				id: 5,
				email: 'a@b.c',
			});

			await expect(
				httpBody(service.forgotPassword(req, { email: 'a@b.c' } as any)),
			).resolves.toMatchObject({
				status: HttpStatus.OK,
				success: true,
				message: 'The reset password link has been sent',
			});

			expect(nodemailerService.sendEmail).toHaveBeenCalledTimes(1);
			const [to, from, link] = (nodemailerService.sendEmail as jest.Mock).mock
				.calls[0];
			expect(to).toBe('a@b.c');
			expect(from).toBe(configValues.EMAIL);
			expect(link).toMatch(/^http:\/\/localhost:3000\/forgot\?token=.+/);
		});

		it('maps mailer failures to a 400 response', async () => {
			const service = buildService();
			(usersRepository.findOne as jest.Mock).mockResolvedValue({
				id: 5,
				email: 'a@b.c',
			});
			(nodemailerService.sendEmail as jest.Mock).mockImplementation(() => {
				throw new Error('SMTP down');
			});

			await expect(
				httpBody(service.forgotPassword(req, { email: 'a@b.c' } as any)),
			).resolves.toMatchObject({
				status: HttpStatus.BAD_REQUEST,
				message: 'SMTP down',
			});
		});
	});

	describe('resetPassword', () => {
		const dto = { password: 'new-secret', repeatPassword: 'new-secret' };

		it('rejects an unknown account id', async () => {
			const service = buildService();
			(usersRepository.findByPk as jest.Mock).mockResolvedValue(null);

			await expect(
				httpBody(service.resetPassword(req, dto as any, 99)),
			).resolves.toMatchObject({
				status: HttpStatus.BAD_REQUEST,
				message: 'The account is not found',
			});
		});

		it('rejects mismatched passwords', async () => {
			const service = buildService();
			(usersRepository.findByPk as jest.Mock).mockResolvedValue({ id: 5 });

			await expect(
				httpBody(
					service.resetPassword(
						req,
						{ ...dto, repeatPassword: 'nope' } as any,
						5,
					),
				),
			).resolves.toMatchObject({
				status: HttpStatus.BAD_REQUEST,
				message: 'The password and the repeat password do not match',
			});
			expect(usersRepository.update).not.toHaveBeenCalled();
		});

		it('stores a hashed password on success', async () => {
			const service = buildService();
			(usersRepository.findByPk as jest.Mock).mockResolvedValue({ id: 5 });
			(usersRepository.update as jest.Mock).mockResolvedValue([1]);

			await expect(
				httpBody(service.resetPassword(req, dto as any, 5)),
			).resolves.toMatchObject({
				status: HttpStatus.OK,
				success: true,
				message: 'The password has been updated',
			});

			expect(usersRepository.update).toHaveBeenCalledWith(
				{ password: expect.stringMatching(/^\$2[aby]\$/) },
				{ where: { id: 5 } },
			);
		});
	});
});
