// ========== Project Service
// import all modules
import { Body, Inject, Injectable, Request, HttpStatus } from '@nestjs/common';
import { IRequestWithUploadAndAppLocals } from 'src/interfaces';
import { ResponseService } from 'src/response/response.service';
import { TechnologiesService } from 'src/technologies/technologies.service';
import { UploadService } from 'src/upload/upload.service';
import { CreateProjectDto } from './dto';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
	constructor(
		private readonly responseService: ResponseService,
		private readonly uploadService: UploadService,
		private readonly technologiesService: TechnologiesService,
		@Inject('PROJECTS_REPOSITORY')
		private readonly projectsRepository: typeof Project,
	) {}

	public async createProject(
		@Request() req: IRequestWithUploadAndAppLocals,
		@Body() dto: CreateProjectDto,
	) {
		try {
			const isExists = await this.projectsRepository.findOne({
				where: {
					title: dto.title,
				},
			});

			if (isExists) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.BAD_REQUEST,
					false,
					'The project already exists',
				);
			}

			try {
				const {
					success,
					img = null,
					message,
					status,
				} = await this.uploadService.uploadImage(req);

				if (!success) {
					throw this.responseService.responseGenerator(
						req,
						status,
						false,
						message,
					);
				}

				try {
					const results = await this.projectsRepository.create({
						title: dto.title,
						description: dto.description,
						img,
					});

					const technologies = dto.technologies.split(',');
					const technologiesData = technologies.map((item) => ({
						projectId: results.id,
						name: item.trim(),
					}));

					try {
						await this.technologiesService.createTechnologies(technologiesData);
						throw this.responseService.responseGenerator(
							req,
							HttpStatus.CREATED,
							true,
							'The project has been inserted',
						);
					} catch (err) {
						if (err instanceof Error) {
							throw this.responseService.responseGenerator(
								req,
								HttpStatus.BAD_REQUEST,
								false,
								err.message,
							);
						} else {
							throw err;
						}
					}
				} catch (err) {
					if (err instanceof Error) {
						throw this.responseService.responseGenerator(
							req,
							HttpStatus.BAD_REQUEST,
							false,
							err.message,
						);
					} else {
						throw err;
					}
				}
			} catch (err) {
				if (err instanceof Error) {
					throw this.responseService.responseGenerator(
						req,
						HttpStatus.BAD_REQUEST,
						false,
						err.message,
					);
				} else {
					throw err;
				}
			}
		} catch (err) {
			if (err instanceof Error) {
				throw this.responseService.response({
					status: HttpStatus.BAD_REQUEST,
					success: false,
					message: err.message,
				});
			} else {
				throw this.responseService.response(err);
			}
		}
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
