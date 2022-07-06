// ========== Project Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from 'src/validation.pipe';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { projectsProviders } from './projects.providers';

@Module({
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		ProjectService,
		...projectsProviders,
	],
	controllers: [ProjectController],
})
export class ProjectModule {}
