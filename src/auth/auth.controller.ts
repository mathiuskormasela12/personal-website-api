// ========== Auth Controller
// import all modules
import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('/auth/register')
	public register() {
		throw this.authService.register();
	}

	@Post('/auth/login')
	public login() {
		throw this.authService.login();
	}

	@Post('/auth/acess-token')
	public createAccessTokenUsingRefreshToken() {
		throw this.authService.createAccessTokenUsingRefreshToken();
	}
}
