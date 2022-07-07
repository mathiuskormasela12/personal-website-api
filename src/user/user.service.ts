// ========== User Service
// import all modules
import {
	HttpStatus,
	Inject,
	Injectable,
	Param,
	ParseIntPipe,
	Request,
	Response,
} from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { IRequestWithUpload, IResponseWithDownload } from 'src/interfaces';
import { ResponseService } from 'src/response/response.service';
import { UploadService } from 'src/upload/upload.service';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		private readonly responseService: ResponseService,
		private readonly uploadService: UploadService,
		@Inject('USERS_REPOSITORY')
		private readonly usersRepository: typeof User,
	) {}

	public forgotPassword() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'Hello this is forgot password API',
		});
	}

	public resetPassword() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'Hello this is reset password API',
		});
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
