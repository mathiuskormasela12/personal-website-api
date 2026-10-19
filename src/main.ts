// ========== Main
import { NestFactory } from '@nestjs/core';
import {
	HttpException,
	Logger,
	ValidationPipe,
	HttpStatus,
	ValidationError,
} from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import constants from './constants';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Resolve the listening target (repo rule): the port comes from the PORT
 * environment variable and the server binds to 0.0.0.0. PORT may be unset,
 * empty, or garbage — then the default 9000 is used.
 */
export function getListenTarget(): { port: number; host: string } {
	const parsed = Number(process.env.PORT);
	const port = Number.isInteger(parsed) && parsed > 0 ? parsed : 9000;
	return { port, host: '0.0.0.0' };
}

/**
 * Validation errors keep the API's `{status, success, message}` response
 * shape (the legacy custom pipe used to throw that), reported as a 400.
 */
export function validationExceptionFactory(errors: ValidationError[]) {
	const [first] = errors;
	const message =
		first && first.constraints
			? String(Object.values(first.constraints)[0])
			: 'Validation failed';
	return new HttpException(
		{ status: HttpStatus.BAD_REQUEST, success: false, message },
		HttpStatus.BAD_REQUEST,
	);
}

/** OpenAPI docs + Swagger UI at /api-docs (spec at /api-docs-json). */
export function setupSwagger(app: INestApplication): void {
	const document = SwaggerModule.createDocument(
		app,
		new DocumentBuilder()
			.setTitle('Personal Website API')
			.setDescription(
				'RESTful API of the personal website. Protected routes expect the JWT in the `x-access-token` header.',
			)
			.setVersion('0.1')
			.addApiKey(
				{ type: 'apiKey', name: 'x-access-token', in: 'header' },
				'x-access-token',
			)
			.build(),
	);
	SwaggerModule.setup('', app, document, {
		// UI is served at '/' — keep the OpenAPI document at /api-docs-json
		// (the default would be a bare '-json' path).
		jsonDocumentUrl: 'api-docs-json',
	});
}

/** Middlewares, CORS, validation and upload wiring, shared by bootstrap and tests. */
export function configureApp(app: INestApplication): INestApplication {
	app.use(compression());
	app.use(helmet());
	app.use(morgan('dev'));

	app.enableCors({
		origin: constants.WHITELIST,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			exceptionFactory: validationExceptionFactory,
		}),
	);

	return app;
}

export async function bootstrap() {
	const { API_URL } = process.env;

	const app = configureApp(await NestFactory.create(AppModule));
	setupSwagger(app);

	const { port, host } = getListenTarget();
	await app.listen(port, host);
	Logger.log(
		`The RESTful API is listening on ${host}:${port}${API_URL ? ` (${API_URL})` : ''}`,
	);
	return app;
}

// Only run when executed directly (tests import this module without booting).
if (require.main === module) {
	bootstrap();
}
