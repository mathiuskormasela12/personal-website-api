// ========== Auth Module
// import all modules
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.entity';

@Module({
	imports: [
		SequelizeModule.forFeature([User]),
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
	providers: [AuthService],
	controllers: [AuthController],
})
export default class AuthModule {}
