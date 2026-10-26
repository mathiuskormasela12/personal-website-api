import { HttpStatus, Injectable, OnModuleInit, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseService } from 'src/response/response.service';
import { UpdateProfileDto } from './dto';
import {
	PROFILE_DEFAULTS,
	PROFILE_FIELDS,
	ProfileData,
} from './profile.defaults';
import { Profile } from './profile.entity';

@Injectable()
export class ProfileService implements OnModuleInit {
	constructor(
		private readonly responseService: ResponseService,
		@InjectModel(Profile)
		private readonly profileRepository: typeof Profile,
	) {}

	public async onModuleInit() {
		await this.profileRepository.sync({ alter: true });
	}

	public async getProfile(@Request() req: Request) {
		try {
			const profile = await this.findProfile();

			return this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'Get the profile',
				this.toData(profile ?? PROFILE_DEFAULTS),
			);
		} catch (err) {
			throw this.serverError(err);
		}
	}

	public async updateProfile(@Request() req: Request, dto: UpdateProfileDto) {
		try {
			const values = this.toData(dto);
			const profile = await this.findProfile();
			const saved = profile
				? await profile.update(values)
				: await this.profileRepository.create(values);

			return this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'The profile has been updated',
				this.toData(saved),
			);
		} catch (err) {
			throw this.serverError(err);
		}
	}

	private findProfile() {
		return this.profileRepository.findOne({ order: [['id', 'ASC']] });
	}

	private toData(source: ProfileData): ProfileData {
		return PROFILE_FIELDS.reduce(
			(data, field) => ({
				...data,
				[field]:
					field === 'skills'
						? [...source.skills]
						: (source[field] ?? PROFILE_DEFAULTS[field]),
			}),
			{} as ProfileData,
		);
	}

	private serverError(err: unknown) {
		return this.responseService.response({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			success: false,
			message: err instanceof Error ? err.message : 'Something went wrong',
		});
	}
}
