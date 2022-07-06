// ========== Auth Controller
// import all modules
import { Body, Controller, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccessTokenDto, LoginDto, RegisterDto } from './dto';

@Controller('api/v1')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('/auth/register')
	public register(@Request() req: Request, @Body() dto: RegisterDto) {
		return this.authService.register(req, dto);
	}

	@Post('/auth/login')
	public login(@Request() req: Request, @Body() dto: LoginDto) {
		return this.authService.login(req, dto);
	}

	@Post('/auth/acess-token')
	public createAccessTokenUsingRefreshToken(
		@Request() req: Request,
		@Body() dto: CreateAccessTokenDto,
	) {
		return this.authService.createAccessTokenUsingRefreshToken(req, dto);
	}
}
