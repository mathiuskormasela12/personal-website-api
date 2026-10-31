import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExperienceController } from './experience.controller';
import { Experience } from './experience.entity';
import { ExperienceService } from './experience.service';

@Module({
	imports: [
		SequelizeModule.forFeature([Experience]),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get('SECRET_KEY'),
			}),
		}),
	],
	providers: [ExperienceService],
	controllers: [ExperienceController],
})
export class ExperienceModule {}
