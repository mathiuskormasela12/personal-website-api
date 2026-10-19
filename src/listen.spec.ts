// ========== Boot integration test: the server must listen on 0.0.0.0:<PORT>.
// The real Sequelize provider is overridden because there is no MySQL here.
process.env.PORT = '9147';
import { Test } from '@nestjs/testing';
import { configureApp, getListenTarget, setupSwagger } from './main';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';

describe('bootstrap (integration)', () => {
	it('listens on 0.0.0.0 at the PORT from the environment', async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
			.overrideProvider(Sequelize)
			.useValue({ define: jest.fn(), authenticate: jest.fn() })
			.compile();

		const app = configureApp(moduleRef.createNestApplication());
		setupSwagger(app);
		const { port, host } = getListenTarget();
		await app.listen(port, host);

		const address = app.getHttpServer().address();
		expect(address).toMatchObject({ port: 9147, address: '0.0.0.0' });

		const response = await fetch('http://127.0.0.1:9147/');
		expect(response.status).toBeLessThan(500);

		// Swagger UI is served at the root; the OpenAPI document at /api-docs-json.
		const root = await fetch('http://127.0.0.1:9147/');
		expect(root.status).toBe(200);
		expect(await root.text()).toContain('Swagger UI');

		const docsJson = await fetch('http://127.0.0.1:9147/api-docs-json');
		expect(docsJson.status).toBe(200);
		const spec = await docsJson.json();
		expect(spec.info.title).toBe('Personal Website API');
		expect(Object.keys(spec.paths)).toEqual(
			expect.arrayContaining([
				'/api/v1/auth/register',
				'/api/v1/auth/login',
				'/api/v1/projects',
			]),
		);

		// Validation errors must keep the API's {status, success, message} shape.
		const invalid = await fetch('http://127.0.0.1:9147/api/v1/auth/register', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				email: 'not-an-email',
				password: 'x',
				repeatPassword: 'x',
			}),
		});
		expect(invalid.status).toBe(400);
		expect(await invalid.json()).toMatchObject({
			status: 400,
			success: false,
		});

		await app.close();
	}, 30000);

	it('getListenTarget falls back to 9000 without PORT', () => {
		const previous = process.env.PORT;
		delete process.env.PORT;
		try {
			expect(getListenTarget()).toEqual({ port: 9000, host: '0.0.0.0' });
		} finally {
			process.env.PORT = previous;
		}
	});
});
