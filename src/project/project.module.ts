// ========== Project Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { technologiesProviders } from 'src/technologies/technologies.providers';
import { ValidationPipe } from 'src/validation.pipe';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { projectsProviders } from './projects.providers';

@Module({
	imports: [JwtModule.register({})],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		ProjectService,
		...projectsProviders,
		...technologiesProviders,
	],
	controllers: [ProjectController],
})
export class ProjectModule {}
