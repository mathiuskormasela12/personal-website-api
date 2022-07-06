// ========== Project Service
// import all modules
import { Injectable } from '@nestjs/common';
import { ResponseService } from 'src/response/response.service';

@Injectable()
export class ProjectService {
	constructor(private readonly responseService: ResponseService) {}

	public createProject() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'This is a create project API',
		});
	}

	public getAllProjects() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'This is a get all projects API',
		});
	}

	public getProject() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'This is a get project API',
		});
	}

	public updateProject() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'This is a update project API',
		});
	}

	public deleteProject() {
		throw this.responseService.response({
			status: 200,
			success: true,
			message: 'This is a delete project API',
		});
	}
}
