// ========== User Module
// import all modules
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from 'src/validation.pipe';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { usersProviders } from './users.providers';

@Module({
	providers: [
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		UserService,
		...usersProviders,
	],
	controllers: [UserController],
})
export class UserModule {}
