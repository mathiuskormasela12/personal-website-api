// ========== Auth Service unit tests
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ResponseService } from 'src/response/response.service';
import { User } from 'src/user/user.entity';

const req: any = { url: 'http://localhost:3000/auth/register' };

const configValues = {
	JWT_ACCESS_TOKEN_SECRET_KEY: 'access-secret',
	JWT_ACCESS_TOKEN_EXPIRES_IN: '1h',
	JWT_REFRESH_TOKEN_SECRET_KEY: 'refresh-secret',
	JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
	WEB_HOSTNAME: 'http://localhost:3000',
	EMAIL: 'no-reply@example.com',
};

const configService = {
	get: jest.fn((key: string) => configValues[key]),
} as unknown as ConfigService;

const jwtService = {
	sign: jest.fn((payload: unknown, options: { secret: string }) =>
		options.secret === 'access-secret' ? 'signed.access' : 'signed.refresh',
	),
	verify: jest.fn(() => ({ id: 1, email: 'a@b.c' })),
} as unknown as JwtService;

const usersRepository = {
	findOne: jest.fn(),
	create: jest.fn(),
} as unknown as typeof User;

const buildService = () =>
	new AuthService(
		new ResponseService(configService),
		jwtService,
		configService,
		usersRepository,
	);

/**
 * Services signal both success and failure by throwing HttpExceptions
 * (or returning bodies); unwrap the HttpException payload for assertions.
 */
async function httpBody(promise: Promise<unknown>) {
	try {
		return await promise;
	} catch (err: any) {
		return err.response ?? err;
	}
}

const registerDto = {
	email: 'a@b.c',
	password: 'secret123',
	repeatPassword: 'secret123',
};

beforeEach(() => {
	jest.clearAllMocks();
	(usersRepository.findOne as jest.Mock).mockReset();
	(usersRepository.create as jest.Mock).mockReset();
});

describe('AuthService', () => {
	describe('register', () => {
		it('rejects mismatched passwords before touching the database', async () => {
			const service = buildService();

			await expect(
				httpBody(
					service.register(req, { ...registerDto, repeatPassword: 'other' }),
				),
			).resolves.toMatchObject({
				status: 400,
				success: false,
				message: 'The password does not match',
			});
			expect(usersRepository.findOne).not.toHaveBeenCalled();
		});

		it('rejects an email that already exists', async () => {
			const service = buildService();
			(usersRepository.findOne as jest.Mock).mockResolvedValue({
				id: 1,
				email: registerDto.email,
			});

			await expect(service.register(req, registerDto)).rejects.toBeInstanceOf(
				HttpException,
			);
			await expect(
				httpBody(service.register(req, registerDto)),
			).resolves.toMatchObject({
				status: 400,
				message: 'The email has been used already',
			});
			expect(usersRepository.create).not.toHaveBeenCalled();
		});

		it('creates the user with a hashed password', async () => {
			const service = buildService();
			(usersRepository.findOne as jest.Mock).mockResolvedValue(null);
			(usersRepository.create as jest.Mock).mockResolvedValue({});

			await expect(
				httpBody(service.register(req, registerDto)),
			).resolves.toMatchObject({
				status: 201,
				success: true,
				message: 'Register Successfully',
			});

			expect(usersRepository.create).toHaveBeenCalledTimes(1);
			const [{ email, password }] = (usersRepository.create as jest.Mock).mock
				.calls[0];
			expect(email).toBe(registerDto.email);
			expect(password).not.toBe(registerDto.password);
			expect(password).toMatch(/^\$2[aby]\$/);
		});

		it('maps repository failures to a 400 response', async () => {
			const service = buildService();
			(usersRepository.findOne as jest.Mock).mockResolvedValue(null);
			(usersRepository.create as jest.Mock).mockRejectedValue(
				new Error('database offline'),
			);

			await expect(
				httpBody(service.register(req, registerDto)),
			).resolves.toMatchObject({
				status: 400,
				message: 'database offline',
			});
		});
	});

	describe('login', () => {
		const loginDto = { email: 'a@b.c', password: 'secret123' };

		it('rejects an unknown email', async () => {
			const service = buildService();
			(usersRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(
				httpBody(service.login(req, loginDto)),
			).resolves.toMatchObject({
				status: 400,
				message: 'Username or password is wrong',
			});
		});

		it('rejects a wrong password without issuing tokens', async () => {
			const service = buildService();
			const hashed = await bcryptHash('other-password');
			(usersRepository.findOne as jest.Mock).mockResolvedValue({
				id: 1,
				email: loginDto.email,
				password: hashed,
			});

			await expect(
				httpBody(service.login(req, loginDto)),
			).resolves.toMatchObject({
				status: 400,
				message: 'Username or password is wrong',
			});
			expect(jwtService.sign).not.toHaveBeenCalled();
		});

		it('issues an access and a refresh token on success', async () => {
			const service = buildService();
			(usersRepository.findOne as jest.Mock).mockResolvedValue({
				id: 7,
				email: loginDto.email,
				password: await bcryptHash(loginDto.password),
			});

			await expect(
				httpBody(service.login(req, loginDto)),
			).resolves.toMatchObject({
				status: 200,
				success: true,
				message: 'Login Successfully',
				results: {
					accessToken: 'signed.access',
					refreshToken: 'signed.refresh',
				},
			});

			expect(jwtService.sign).toHaveBeenCalledWith(
				{ id: 7, email: loginDto.email },
				{ expiresIn: '1h', secret: 'access-secret' },
			);
			expect(jwtService.sign).toHaveBeenCalledWith(
				{ id: 7, email: loginDto.email },
				{ expiresIn: '7d', secret: 'refresh-secret' },
			);
		});
	});

	describe('createAccessTokenUsingRefreshToken', () => {
		it('exchanges a valid refresh token for a new pair', async () => {
			const service = buildService();
			(jwtService.verify as jest.Mock).mockReturnValue({
				id: 7,
				email: 'a@b.c',
			});

			await expect(
				httpBody(
					service.createAccessTokenUsingRefreshToken(req, {
						refreshToken: 'valid.refresh',
					}),
				),
			).resolves.toMatchObject({
				status: 201,
				success: true,
				message: 'The access token has been created successfully',
				results: {
					accessToken: 'signed.access',
					refreshToken: 'signed.refresh',
				},
			});
			expect(jwtService.verify).toHaveBeenCalledWith('valid.refresh', {
				secret: 'refresh-secret',
			});
		});

		it('propagates verification failures as a 400 response', async () => {
			const service = buildService();
			(jwtService.verify as jest.Mock).mockImplementation(() => {
				throw new Error('jwt expired');
			});

			await expect(
				httpBody(
					service.createAccessTokenUsingRefreshToken(req, {
						refreshToken: 'broken',
					}),
				),
			).resolves.toMatchObject({ status: 400, message: 'jwt expired' });
		});
	});
});

/** Real bcrypt hash via the same library the service uses. */
function bcryptHash(plain: string): Promise<string> {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const bcrypt = require('bcryptjs');
	return bcrypt.hash(plain, 8);
}
