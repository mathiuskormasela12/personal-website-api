// ========== Technologies Module
// import all modules
import { Global, Module } from '@nestjs/common';
import { technologiesProviders } from './technologies.providers';
import { TechnologiesService } from './technologies.service';

@Global()
@Module({
	providers: [TechnologiesService, ...technologiesProviders],
	exports: [TechnologiesService],
})
export class TechnologiesModule {}
