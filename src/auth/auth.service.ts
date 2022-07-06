// ========== Auth Service
// import all modules
import { Injectable } from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class AuthService {
	constructor(private responseService: ResponseService) {}

	public register() {
		return this.responseService.response({
			status: 200,
			success: true,
			message: 'Hi this is a register API',
		});
	}

	public login() {
		return this.responseService.response({
			status: 200,
			success: true,
			message: 'Hi this is a login API',
		});
	}

	public createAccessTokenUsingRefreshToken() {
		return this.responseService.response({
			status: 200,
			success: true,
			message: 'Hi this is a creating access token API',
		});
	}
}
