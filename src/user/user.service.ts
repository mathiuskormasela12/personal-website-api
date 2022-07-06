// ========== User Service
// import all modules
import { Injectable } from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class UserService {
	constructor(private readonly responseService: ResponseService) {}

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

	public uploadCv() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'Hello this is reset upload CV API',
		});
	}

	public downloadCv() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'Hello this is reset download CV API',
		});
	}
}
