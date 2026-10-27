// ========== CORS integration test: only origins from CORS_WHITELIST get CORS headers.
// The real Sequelize provider is overridden because there is no MySQL here.
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { Profile } from './profile/profile.entity';
import { AppModule } from './app.module';
import { configureApp } from './main';

const PORT = 9148;
const LAN_FRONTEND = 'http://192.168.8.5:3000';
const PUBLIC_FRONTEND = 'https://mathiuskormasela.com';
const WHITELIST = [LAN_FRONTEND, PUBLIC_FRONTEND];
const NOT_LISTED = ['http://192.168.8.7:3000', 'http://192.168.8.99:9000'];

describe('CORS whitelist from CORS_WHITELIST (integration)', () => {
	let app: INestApplication;
	let previousWhitelist: string | undefined;

	beforeAll(async () => {
		previousWhitelist = process.env.CORS_WHITELIST;
		process.env.CORS_WHITELIST = WHITELIST.join(',');
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
			.overrideProvider(Sequelize)
			.useValue({ define: jest.fn(), authenticate: jest.fn() })
			.overrideProvider(getModelToken(Profile))
			.useValue({ sync: jest.fn() })
			.compile();
		app = configureApp(moduleRef.createNestApplication());
		await app.listen(PORT, '127.0.0.1');
	}, 30000);

	afterAll(async () => {
		await app.close();
		if (previousWhitelist === undefined) {
			delete process.env.CORS_WHITELIST;
		} else {
			process.env.CORS_WHITELIST = previousWhitelist;
		}
	});

	const preflight = (origin: string) =>
		fetch(`http://127.0.0.1:${PORT}/api/v1/projects`, {
			method: 'OPTIONS',
			headers: {
				Origin: origin,
				'Access-Control-Request-Method': 'GET',
			},
		});

	it.each(WHITELIST)('allows preflight requests from %s', async (origin) => {
		const response = await preflight(origin);
		expect(response.status).toBeLessThan(300);
		expect(response.headers.get('access-control-allow-origin')).toBe(origin);
	});

	it.each(NOT_LISTED)('does not allow %s', async (origin) => {
		const response = await preflight(origin);
		expect(response.headers.get('access-control-allow-origin')).toBeNull();
	});
});
