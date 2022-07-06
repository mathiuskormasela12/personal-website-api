// ========== Projects Providers
// import all modules
import { Project } from './project.entity';

export const projectsProviders = [
	{
		provide: 'PROJECTS_REPOSITORY',
		useValue: Project,
	},
];
