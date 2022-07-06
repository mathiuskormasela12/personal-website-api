// ========== Technologies Providers
// import all modules

import { Technology } from './technology.entity';

export const technologiesProviders = [
	{
		provide: 'TECHNOLOGIES_REPOSITORY',
		useValue: Technology,
	},
];
