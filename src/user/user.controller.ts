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
	Body,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { IRequestWithUpload, IResponseWithDownload } from 'src/interfaces';
import { ForgotPasswordDto, ResetPasswordDto } from './dto';
import { UserService } from './user.service';

@Controller('api/v1')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('user/password')
	public forgotPassword(
		@Request() req: Request,
		@Body() dto: ForgotPasswordDto,
	) {
		return this.userService.forgotPassword(req, dto);
	}

	@Patch('user/password/:id')
	public resetPassword(
		@Request() req: Request,
		@Body() dto: ResetPasswordDto,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.userService.resetPassword(req, dto, id);
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
