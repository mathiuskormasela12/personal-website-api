// ========== User Providers
// import all modules
import { User } from './user.entity';

export const usersProviders = [
	{
		provide: 'USERS_REPOSITORY',
		useValue: User,
	},
];
