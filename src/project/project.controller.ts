// ========== Project Controller
// import all modules
import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	UseGuards,
	Body,
	Request,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { IRequestWithUploadAndAppLocals } from 'src/interfaces';
import { CreateProjectDto } from './dto';
import { ProjectService } from './project.service';

@Controller('api/v1')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@Post('project')
	@UseGuards(AuthGuard)
	public createProject(
		@Request() req: IRequestWithUploadAndAppLocals,
		@Body() dto: CreateProjectDto,
	) {
		return this.projectService.createProject(req, dto);
	}

	@Get('projects')
	@UseGuards(AuthGuard)
	public getAllProjects() {
		return this.projectService.getAllProjects();
	}

	@Get('project/:id')
	@UseGuards(AuthGuard)
	public getProject() {
		return this.projectService.getProject();
	}

	@Patch('project/:id')
	@UseGuards(AuthGuard)
	public updateProject() {
		return this.projectService.updateProject();
	}

	@Delete('project/:id')
	@UseGuards(AuthGuard)
	public deleteProject() {
		return this.projectService.deleteProject();
	}
}
