// ========== User Controller
// import all modules

import { Controller, Patch, Post, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('api/v1')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('user/password')
	public forgotPassword() {
		return this.userService.forgotPassword();
	}

	@Patch('user/password/:id')
	public resetPassword() {
		return this.userService.resetPassword();
	}

	@Patch('user/cv/:id')
	public uploadCv() {
		return this.userService.uploadCv();
	}

	@Get('user/cv/:id')
	public downloadCv() {
		return this.userService.downloadCv();
	}
}
