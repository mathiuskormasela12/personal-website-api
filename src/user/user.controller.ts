// ========== User Controller
// import all modules

import {
	Controller,
	Patch,
	Post,
	Get,
	Request,
	Param,
	ParseIntPipe,
	Response,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { IRequestWithUpload, IResponseWithDownload } from 'src/interfaces';
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
	@UseGuards(AuthGuard)
	public uploadCv(
		@Request() req: IRequestWithUpload,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.userService.uploadCv(req, id);
	}

	@Get('user/cv')
	public downloadCv(
		@Request() req: Request,
		@Response() res: IResponseWithDownload,
	) {
		return this.userService.downloadCv(req, res);
	}
}
