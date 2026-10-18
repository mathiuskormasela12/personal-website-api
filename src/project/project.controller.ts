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
	Param,
	ParseIntPipe,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { IRequestWithUploadAndAppLocals } from 'src/interfaces';
import { CreateOrUpdateProjectDto, GetAllProjectsDto } from './dto';
import { ProjectService } from './project.service';

@Controller('api/v1')
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@Post('project')
	@UseGuards(AuthGuard)
	@UseInterceptors(FileInterceptor('img'))
	public createProject(
		@Request() req: IRequestWithUploadAndAppLocals,
		@UploadedFile() img: Express.Multer.File,
		@Body() dto: CreateOrUpdateProjectDto,
	) {
		return this.projectService.createProject(req, img, dto);
	}

	@Get('projects')
	public getAllProjects(
		@Request() req: Request,
		@Query() dto: GetAllProjectsDto,
	) {
		return this.projectService.getAllProjects(req, dto);
	}

	@Get('project/:id')
	public getProject(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.projectService.getProject(req, id);
	}

	@Patch('project/:id')
	@UseGuards(AuthGuard)
	@UseInterceptors(FileInterceptor('img'))
	public updateProject(
		@Request() req: IRequestWithUploadAndAppLocals,
		@UploadedFile() img: Express.Multer.File,
		@Body() dto: CreateOrUpdateProjectDto,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.projectService.updateProject(req, img, dto, id);
	}

	@Delete('project/:id')
	@UseGuards(AuthGuard)
	public deleteProject(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		return this.projectService.deleteProject(req, id);
	}
}
