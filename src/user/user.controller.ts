// ========== User Controller
// import all modules
import {
	Controller,
	Patch,
	Post,
	Request,
	Param,
	ParseIntPipe,
	Body,
} from '@nestjs/common';
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
}
