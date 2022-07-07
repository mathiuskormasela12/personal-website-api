// ========== User Service
// import all modules
import { MailerService } from '@nestjs-modules/mailer';
import {
	Body,
	HttpStatus,
	Inject,
	Injectable,
	Param,
	ParseIntPipe,
	Request,
	Response,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';
import { IRequestWithUpload, IResponseWithDownload } from 'src/interfaces';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { ResponseService } from 'src/response/response.service';
import { UploadService } from 'src/upload/upload.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
	constructor(
		private readonly responseService: ResponseService,
		private readonly uploadService: UploadService,
		private readonly nodemailerService: NodemailerService,
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		@Inject('USERS_REPOSITORY')
		private readonly usersRepository: typeof User,
	) {}

	public async forgotPassword(
		@Request() req: Request,
		@Body() dto: ForgotPasswordDto,
	) {
		try {
			const isExists = await this.usersRepository.findOne({
				where: { email: dto.email },
			});

			if (!isExists) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The email does not exist',
				);
			}

			const token = this.jwtService.sign(
				{ id: isExists.id },
				{ secret: this.configService.get('SECRET_KEY'), expiresIn: '15m' },
			);
			const link = `${this.configService.get('WEB_HOSTNAME')}/reset/${token}`;

			try {
				await this.nodemailerService.sendEmail(
					this.mailerService,
					dto.email,
					this.configService.get('EMAIL'),
					link,
				);

				throw this.responseService.responseGenerator(
					req,
					HttpStatus.OK,
					true,
					'The reset password link has been sent',
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

	public async resetPassword(
		@Request() req: Request,
		@Body() dto: ResetPasswordDto,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const user = await this.usersRepository.findByPk(id);

			if (!user) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The account is not found',
				);
			}

			if (dto.password !== dto.repeatPassword) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The password and the repeat password do not match',
				);
			}

			try {
				const hashed: string = await bcrypt.hash(dto.password, 8);

				try {
					await this.usersRepository.update(
						{ password: hashed },
						{ where: { id: user.id } },
					);

					throw this.responseService.responseGenerator(
						req,
						HttpStatus.OK,
						true,
						'The password has been updated',
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

	public async uploadCv(
		@Request() req: IRequestWithUpload,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const isExists = await this.usersRepository.findByPk(id);

			if (!isExists) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The account is not found',
				);
			}

			const {
				success,
				cv = null,
				message,
			} = await this.uploadService.uploadPdf(req);

			if (!success) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					message,
				);
			}

			try {
				await this.usersRepository.update({ cv }, { where: { id } });

				if (existsSync(join(__dirname, '../../uploads/' + isExists.cv))) {
					unlinkSync(join(__dirname, '../../uploads/' + isExists.cv));
				}

				throw this.responseService.responseGenerator(
					req,
					HttpStatus.OK,
					true,
					'Your cv has been uploaded',
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

	public async downloadCv(
		@Request() req: Request,
		@Response() res: IResponseWithDownload,
	) {
		try {
			const isExists = await this.usersRepository.findOne({
				order: [['updatedAt', 'ASC']],
			});

			if (!isExists) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The accounts is not found',
				);
			}

			if (!isExists.cv) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The cv does not exists',
				);
			}

			const cvLink = join(__dirname, '../../uploads/' + isExists.cv);

			res.download(cvLink);
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
}
