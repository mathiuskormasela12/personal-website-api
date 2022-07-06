// ========== Project Controller
// import all modules
import { Controller, Post, Get, Patch, Delete } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('api/v1')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@Post('project')
	public createProject() {
		return this.projectService.createProject();
	}

	@Get('projects')
	public getAllProjects() {
		return this.projectService.getAllProjects();
	}

	@Get('project/:id')
	public getProject() {
		return this.projectService.getProject();
	}

	@Patch('project/:id')
	public updateProject() {
		return this.projectService.updateProject();
	}

	@Delete('project/:id')
	public deleteProject() {
		return this.projectService.deleteProject();
	}
}
