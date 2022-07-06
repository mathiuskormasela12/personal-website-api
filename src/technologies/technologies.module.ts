// ========== Technologies Module
// import all modules
import { Global, Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from 'src/validation.pipe';
import { technologiesProviders } from './technologies.providers';
import { TechnologiesService } from './technologies.service';

@Global()
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
