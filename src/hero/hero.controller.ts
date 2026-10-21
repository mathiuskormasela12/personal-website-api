// ========== Hero Controller
// import all modules
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
import { UpdateHeroDto } from './dto';
import { HeroService } from './hero.service';

@Controller('api/v1')
export class HeroController {
	constructor(private readonly heroService: HeroService) {}

	/** Home-page hero texts (public). */
	@Get('hero')
	public getHero(@Request() req: Request) {
		return this.heroService.getHero(req);
	}

	/** Replace the home-page hero texts (admin). */
	@Patch('hero')
	@ApiSecurity('x-access-token')
	@UseGuards(AuthGuard)
	public updateHero(@Request() req: Request, @Body() dto: UpdateHeroDto) {
		return this.heroService.updateHero(req, dto);
	}
}
