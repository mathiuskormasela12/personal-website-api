// ========== Auth Service
// import all modules
import { Body, HttpStatus, Inject, Injectable, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IJwtToken } from 'src/interfaces';
import { ResponseService } from 'src/response/response.service';
import { User } from 'src/user/user.entity';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly responseService: ResponseService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		@Inject('USERS_REPOSITORY') private readonly usersRepository: typeof User,
	) {}

	public async register(@Request() req: Request, @Body() dto: RegisterDto) {
		if (dto.password !== dto.repeatPassword) {
			return this.responseService.responseGenerator(
				req,
				HttpStatus.BAD_REQUEST,
				false,
				'The password does not match',
			);
		}

		try {
			const isEmailExists = await this.usersRepository.findOne({
				where: {
					email: dto.email,
				},
			});

			if (isEmailExists) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The email has been used already',
				);
			}

			try {
				const hashed: string = await bcrypt.hash(dto.password, 8);

				try {
					await this.usersRepository.create({
						email: dto.email,
						password: hashed,
					});

					throw this.responseService.responseGenerator(
						req,
						HttpStatus.CREATED,
						true,
						'Register Successfully',
					);
				} catch (err) {
					if (err instanceof Error) {
						throw this.responseService.responseGenerator(
							req,
							HttpStatus.BAD_REQUEST,
							false,
							err.message,
						);
					} else {
						throw err;
					}
				}
			} catch (err) {
				if (err instanceof Error) {
					throw this.responseService.responseGenerator(
						req,
						HttpStatus.BAD_REQUEST,
						false,
						err.message,
					);
				} else {
					throw err;
				}
			}
		} catch (err) {
			if (err instanceof Error) {
				throw this.responseService.response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			} else {
				throw this.responseService.response(err);
			}
		}
	}

	public async login(@Request() req: Request, @Body() dto: LoginDto) {
		try {
			const isEmailExists = await this.usersRepository.findOne({
				where: {
					email: dto.email,
				},
			});

			if (
				!isEmailExists ||
				!(await bcrypt.compare(dto.password, isEmailExists.password))
			) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'Username or password is wrong',
				);
			}

			const accessToken: string = await this.generateAccessToken({
				id: isEmailExists.id,
				email: isEmailExists.email,
			});

			const refreshToken: string = await this.generateRefreshToken({
				id: isEmailExists.id,
				email: isEmailExists.email,
			});

			throw this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'Login Successfully',
				{ accessToken, refreshToken },
			);
		} catch (err) {
			if (err instanceof Error) {
				throw this.responseService.response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			} else {
				throw this.responseService.response(err);
			}
		}
	}

	public createAccessTokenUsingRefreshToken() {
		return this.responseService.response({
			status: 200,
			success: true,
			message: 'Hi this is a creating access token API',
		});
	}

	public async generateAccessToken(data: IJwtToken): Promise<string> {
		const secret: string = this.configService.get(
			'JWT_ACCESS_TOKEN_SECRET_KEY',
		);
		const expiresIn: string = this.configService.get(
			'JWT_ACCESS_TOKEN_EXPIRES_IN',
		);

		return await this.jwtService.sign(data, { expiresIn, secret });
	}

	public async generateRefreshToken(data: IJwtToken): Promise<string> {
		const secret: string = this.configService.get(
			'JWT_REFRESH_TOKEN_SECRET_KEY',
		);
		const expiresIn: string = this.configService.get(
			'JWT_REFRESH_TOKEN_EXPIRES_IN',
		);

		return await this.jwtService.sign(data, { expiresIn, secret });
	}
}
