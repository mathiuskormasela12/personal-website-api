import { HttpStatus, Injectable, OnModuleInit, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseService } from 'src/response/response.service';
import { CreateOrUpdateExperienceDto } from './dto';
import { Experience } from './experience.entity';
import {
	migrateExperienceDescriptions,
	toDescriptionPoints,
} from './experience.migration';

export interface IExperienceData {
	id: number;
	company: string;
	role: string;
	startDate: string;
	endDate: string | null;
	description: string[];
}

export const sortExperiences = (experiences: IExperienceData[]) =>
	[...experiences].sort((first, second) => {
		const currentFirst =
			Number(second.endDate === null) - Number(first.endDate === null);
		if (currentFirst !== 0) {
			return currentFirst;
		}
		if (first.startDate !== second.startDate) {
			return first.startDate < second.startDate ? 1 : -1;
		}
		return second.id - first.id;
	});

export const getCurrentMonth = (now: Date = new Date()) =>
	now.toISOString().slice(0, 7);

export const findDateProblem = (
	dto: CreateOrUpdateExperienceDto,
	currentMonth: string = getCurrentMonth(),
): string | null => {
	if (dto.startDate > currentMonth) {
		return "The start date can't be in the future";
	}
	if (dto.endDate === null) {
		return null;
	}
	if (dto.endDate < dto.startDate) {
		return "The end date can't be before the start date";
	}
	if (dto.endDate > currentMonth) {
		return "The end date can't be in the future";
	}
	return null;
};

@Injectable()
export class ExperienceService implements OnModuleInit {
	constructor(
		private readonly responseService: ResponseService,
		@InjectModel(Experience)
		private readonly experienceRepository: typeof Experience,
	) {}

	public async onModuleInit() {
		await migrateExperienceDescriptions(this.experienceRepository);
		await this.experienceRepository.sync({ alter: true });
	}

	public async getExperiences() {
		try {
			const experiences = await this.experienceRepository.findAll();

			return {
				status: HttpStatus.OK,
				success: true,
				message: 'Get all experiences',
				results: sortExperiences(
					experiences.map((experience) => this.toData(experience)),
				),
			};
		} catch (err) {
			throw this.serverError(err);
		}
	}

	public async createExperience(
		@Request() req: Request,
		dto: CreateOrUpdateExperienceDto,
	) {
		this.assertDates(dto);

		try {
			const saved = await this.experienceRepository.create(this.toValues(dto));

			return this.responseService.responseGenerator(
				req,
				HttpStatus.CREATED,
				true,
				'The experience has been added',
				this.toData(saved),
			);
		} catch (err) {
			throw this.serverError(err);
		}
	}

	public async updateExperience(
		@Request() req: Request,
		id: number,
		dto: CreateOrUpdateExperienceDto,
	) {
		this.assertDates(dto);
		const experience = await this.findExperience(id);

		try {
			const saved = await experience.update(this.toValues(dto));

			return this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'The experience has been updated',
				this.toData(saved),
			);
		} catch (err) {
			throw this.serverError(err);
		}
	}

	public async deleteExperience(@Request() req: Request, id: number) {
		const experience = await this.findExperience(id);

		try {
			await experience.destroy();

			return this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'The experience has been deleted',
			);
		} catch (err) {
			throw this.serverError(err);
		}
	}

	private async findExperience(id: number) {
		let experience: Experience | null;

		try {
			experience = await this.experienceRepository.findByPk(id);
		} catch (err) {
			throw this.serverError(err);
		}

		if (!experience) {
			throw this.responseService.response({
				status: HttpStatus.NOT_FOUND,
				success: false,
				message: 'The experience is not found',
			});
		}

		return experience;
	}

	private assertDates(dto: CreateOrUpdateExperienceDto) {
		const problem = findDateProblem(dto);

		if (problem) {
			throw this.responseService.response({
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: problem,
			});
		}
	}

	private toValues(dto: CreateOrUpdateExperienceDto) {
		return {
			company: dto.company,
			role: dto.role,
			startDate: dto.startDate,
			endDate: dto.endDate,
			description: dto.description,
		};
	}

	private toData(experience: Experience): IExperienceData {
		return {
			id: Number(experience.id),
			company: experience.company,
			role: experience.role,
			startDate: experience.startDate,
			endDate: experience.endDate,
			description: toDescriptionPoints(experience.description),
		};
	}

	private serverError(err: unknown) {
		return this.responseService.response({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			success: false,
			message: err instanceof Error ? err.message : 'Something went wrong',
		});
	}
}
