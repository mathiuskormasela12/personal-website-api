// ========== Boot integration test: the server must listen on 0.0.0.0:<PORT>.
// The real Sequelize provider is overridden because there is no MySQL here.
process.env.PORT = '9147';

import { Test } from '@nestjs/testing';
import { configureApp, getListenTarget } from './main';
import { AppModule } from './app.module';

describe('bootstrap (integration)', () => {
	it('listens on 0.0.0.0 at the PORT from the environment', async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
			.overrideProvider('SEQUELIZE')
			.useValue({ define: jest.fn() })
			.compile();

		const app = configureApp(moduleRef.createNestApplication());
		const { port, host } = getListenTarget();
		await app.listen(port, host);

		const address = app.getHttpServer().address();
		expect(address).toMatchObject({ port: 9147, address: '0.0.0.0' });

		const response = await fetch('http://127.0.0.1:9147/');
		expect(response.status).toBeLessThan(500);

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
