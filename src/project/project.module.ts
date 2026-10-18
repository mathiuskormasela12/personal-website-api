// ========== Project Module
// import all modules
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { technologiesProviders } from 'src/technologies/technologies.providers';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { projectsProviders } from './projects.providers';

@Module({
	imports: [
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get('SECRET_KEY'),
				signOptions: {
					expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') || '1h',
				},
			}),
		}),
	],
	providers: [ProjectService, ...projectsProviders, ...technologiesProviders],
	controllers: [ProjectController],
})
export class ProjectModule {}
