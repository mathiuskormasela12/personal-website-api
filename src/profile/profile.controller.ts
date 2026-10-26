import {
	Body,
	Controller,
	Get,
	Patch,
	Request,
	UseGuards,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProfileDto } from './dto';
import { ProfileService } from './profile.service';

@Controller('api/v1')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get('profile')
	public getProfile(@Request() req: Request) {
		return this.profileService.getProfile(req);
	}

	@Patch('profile')
	@ApiSecurity('x-access-token')
	@UseGuards(AuthGuard)
	public updateProfile(@Request() req: Request, @Body() dto: UpdateProfileDto) {
		return this.profileService.updateProfile(req, dto);
	}
}
