// ========== Auth Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { usersProviders } from 'src/user/users.providers';
import { ValidationPipe } from 'src/validation.pipe';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [JwtModule.register({})],
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		AuthService,
		...usersProviders,
	],
	controllers: [AuthController],
})
export default class AuthModule {}
