// ========== Technologies Service
// import all modules

import { Injectable } from '@nestjs/common';

@Injectable()
export class TechnologiesService {
	public createTechnologies() {
		return [
			{
				id: 1,
				name: 'HTML',
			},
		];
	}
}
