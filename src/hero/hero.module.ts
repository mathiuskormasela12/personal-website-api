// ========== Hero Module
// import all modules
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { HeroController } from './hero.controller';
import { Hero } from './hero.entity';
import { HeroService } from './hero.service';

@Module({
	imports: [
		SequelizeModule.forFeature([Hero]),
		// AuthGuard needs JwtService
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get('SECRET_KEY'),
			}),
		}),
	],
	providers: [HeroService],
	controllers: [HeroController],
})
export class HeroModule {}
