// ========== Technologies Service
// import all modules
import { Inject, Injectable } from '@nestjs/common';
import { Technology } from './technology.entity';

@Injectable()
export class TechnologiesService {
	constructor(
		@Inject('TECHNOLOGIES_REPOSITORY')
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
