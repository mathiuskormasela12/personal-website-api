// ========== App Module
// import all modules
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import AuthModule from './auth/auth.module';
import { ResponseModule } from './response/response.module';
import { DatabaseModule } from './database/database.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';

const { EMAIL, EMAIL_PASSWORD, EMAIL_HOST } = process.env;

@Module({
	imports: [
		// Setup for environment variables
		ConfigModule.forRoot({
			isGlobal: true,
		}),

		// Setup for serving static files
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '../uploads'),
		}),

		// Setup for node mailer
		MailerModule.forRoot({
			transport: `smtps://${EMAIL}:${EMAIL_PASSWORD}@${EMAIL_HOST}`,
		}),

		AuthModule,
		UserModule,
		ProjectModule,
		TechnologiesModule,
		UploadModule,
		ResponseModule,
		DatabaseModule,
	],
})
export class AppModule {}
