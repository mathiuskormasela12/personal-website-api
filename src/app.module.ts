// ========== App Module
// import all modules
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { envValidationSchema } from './config/env.validation';
import AuthModule from './auth/auth.module';
import { ResponseModule } from './response/response.module';
import { DatabaseModule } from './database/database.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { ProjectModule } from './project/project.module';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { NodemailerModule } from './nodemailer/nodemailer.module';

@Module({
	imports: [
		// Setup for environment variables
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: envValidationSchema,
			validationOptions: { libraryOptions: { abortEarly: false } },
		}),

		// Setup for serving static files
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '../uploads'),
		}),

		// Setup for node mailer (config from ConfigService, object-form transport
		// so special characters in credentials can't break a connection URL)
		MailerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const port = Number(configService.get('EMAIL_PORT')) || 587;
				return {
					transport: {
						host: configService.get('EMAIL_HOST'),
						port,
						secure: port === 465,
						auth: {
							user: configService.get('EMAIL'),
							pass: configService.get('EMAIL_PASSWORD'),
						},
					},
					template: {
						dir: join(__dirname, 'nodemailer', 'templates'),
						adapter: new HandlebarsAdapter(),
					},
				};
			},
		}),

		AuthModule,
		UserModule,
		ProjectModule,
		TechnologiesModule,
		UploadModule,
		NodemailerModule,
		ResponseModule,
		DatabaseModule,
	],
})
export class AppModule {}
