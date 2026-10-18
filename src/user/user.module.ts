// ========== User Module
// import all modules
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { usersProviders } from './users.providers';

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
	providers: [UserService, ...usersProviders],
	controllers: [UserController],
})
export class UserModule {}
