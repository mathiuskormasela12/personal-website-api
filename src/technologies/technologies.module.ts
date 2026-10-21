// ========== Technologies Module
// import all modules
import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Technology } from './technology.entity';
import { TechnologiesService } from './technologies.service';

@Global()
@Module({
	imports: [SequelizeModule.forFeature([Technology])],
	providers: [TechnologiesService],
	exports: [TechnologiesService],
})
export class TechnologiesModule {}
