// ========== Project Service
// import all modules
import {
	Body,
	Inject,
	Injectable,
	Request,
	HttpStatus,
	Param,
	ParseIntPipe,
	Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IRequestWithUploadAndAppLocals } from 'src/interfaces';
import { ResponseService } from 'src/response/response.service';
import { TechnologiesService } from 'src/technologies/technologies.service';
import { Technology } from 'src/technologies/technology.entity';
import { UploadService } from 'src/upload/upload.service';
import { CreateProjectDto, GetAllProjectsDto } from './dto';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
	constructor(
		private readonly responseService: ResponseService,
		private readonly uploadService: UploadService,
		private readonly configService: ConfigService,
		private readonly technologiesService: TechnologiesService,
		@Inject('PROJECTS_REPOSITORY')
		private readonly projectsRepository: typeof Project,
		@Inject('TECHNOLOGIES_REPOSITORY')
		private readonly technologiesRepository: typeof Technology,
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

	public async getAllProjects(
		@Request() req: Request,
		@Query() dto: GetAllProjectsDto,
	) {
		const { page, limit } = dto;
		const startData: number = limit * page - limit;

		try {
			const results = await this.projectsRepository.findAll({
				attributes: ['id', 'title', 'description', 'img'],
				limit,
				offset: startData,
				order: [['id', 'ASC']],
				include: {
					model: this.technologiesRepository,
					attributes: ['id', 'name'],
				},
			});
			const totalData = results.length;
			const totalPages = Math.ceil(totalData / limit);

			if (results.length < 1) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.NOT_FOUND,
					false,
					'There are not projects',
				);
			}

			const modifiedResults = [];

			for (let index = 0; index < totalData; index++) {
				modifiedResults.push({
					id: results[index].id,
					title: results[index].title,
					description: results[index].description,
					img: `${this.configService.get('APP_URL')}/${results[index].img}`,
					technologies: results[index].technologies,
				});
			}

			throw this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'Success to get all projects',
				modifiedResults,
				totalPages,
				totalData,
			);
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

	public async getProject(
		@Request() req: Request,
		@Param('id', ParseIntPipe) id: number,
	) {
		try {
			const result = await this.projectsRepository.findOne({ where: { id } });

			if (!result) {
				throw this.responseService.responseGenerator(
					req,
					HttpStatus.NOT_FOUND,
					false,
					'The project does not exist',
				);
			}

			const data = {
				id: result.id,
				title: result.title,
				description: result.description,
				img: `${this.configService.get('APP_URL')}/${result.img}`,
			};

			throw this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'Get a project',
				data,
			);
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
