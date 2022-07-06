// ========== Main
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import helmet from 'helmet';
import * as morgan from 'morgan';
import * as expressFileUpload from 'express-fileupload';
import 'dotenv/config';
import constants from './constants';
import { AppModule } from './app.module';

async function bootstrap() {
	const { PORT, API_URL } = process.env;

	const app = await NestFactory.create(AppModule);

	// Setup some of middlewares
	app.use(compression());
	app.use(helmet());
	app.use(morgan('dev'));

	// Setup cors
	app.enableCors({
		origin: constants.WHITELIST,
	});

	// Setup for Validation Pipes
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		}),
	);

	// Middleware setup for uploading files
	app.use(
		expressFileUpload({
			createParentPath: true,
		}),
	);

	await app.listen(PORT);
	Logger.log(`The RESTful API is being run on ${API_URL}`);
}
bootstrap();
