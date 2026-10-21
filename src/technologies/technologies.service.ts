// ========== Technologies Service
// import all modules
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Technology } from './technology.entity';

@Injectable()
export class TechnologiesService {
	constructor(
		@InjectModel(Technology)
		private readonly technologiesRepository: typeof Technology,
	) {}
	public async createTechnologies(data) {
		try {
			return await this.technologiesRepository.bulkCreate(data);
		} catch (err) {
			console.log(err);
			return [];
		}
	}
}
