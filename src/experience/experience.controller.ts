import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateOrUpdateExperienceDto } from './dto';
import { ExperienceService } from './experience.service';

@Controller('api/v1')
export class ExperienceController {
	constructor(private readonly experienceService: ExperienceService) {}

	@Get('experiences')
	public getExperiences() {
		return this.experienceService.getExperiences();
	}

	@Post('experience')
	@ApiSecurity('x-access-token')
	@UseGuards(AuthGuard)
	public createExperience(
		@Request() req: Request,
		@Body() dto: CreateOrUpdateExperienceDto,
	) {
		return this.experienceService.createExperience(req, dto);
	}

	@Patch('experience/:id')
	@ApiSecurity('x-access-token')
	@UseGuards(AuthGuard)
	public updateExperience(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: CreateOrUpdateExperienceDto,
	) {
		return this.experienceService.updateExperience(req, id, dto);
	}

	@Delete('experience/:id')
	@ApiSecurity('x-access-token')
	@UseGuards(AuthGuard)
	public deleteExperience(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.experienceService.deleteExperience(req, id);
	}
}
