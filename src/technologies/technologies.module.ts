// ========== Technologies Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from 'src/validation.pipe';
import { technologiesProviders } from './technologies.providers';
import { TechnologiesService } from './technologies.service';

@Module({
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		TechnologiesService,
		...technologiesProviders,
	],
	exports: [TechnologiesService],
})
export class TechnologiesModule {}
