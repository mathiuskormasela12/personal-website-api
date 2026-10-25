// ========== CORS integration test: only whitelisted origins get CORS headers.
// The real Sequelize provider is overridden because there is no MySQL here.
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { Profile } from './profile/profile.entity';
import { AppModule } from './app.module';
import constants from './constants';
import { configureApp } from './main';

const PORT = 9148;
const LAN_FRONTEND = 'http://192.168.8.5:3000';
const OLD_LAN_FRONTENDS = [
	'http://192.168.8.4:9000',
	'http://192.168.8.4:9001',
];

describe('CORS whitelist (integration)', () => {
	let app: INestApplication;

	beforeAll(async () => {
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
	});

	const preflight = (origin: string) =>
		fetch(`http://127.0.0.1:${PORT}/api/v1/projects`, {
			method: 'OPTIONS',
			headers: {
				Origin: origin,
				'Access-Control-Request-Method': 'GET',
			},
		});

	it('whitelists the LAN frontend origin, not the old ones', () => {
		expect(constants.WHITELIST).toContain(LAN_FRONTEND);
		OLD_LAN_FRONTENDS.forEach((origin) =>
			expect(constants.WHITELIST).not.toContain(origin),
		);
	});

	it.each([LAN_FRONTEND, ...constants.WHITELIST])(
		'allows preflight requests from %s',
		async (origin) => {
			const response = await preflight(origin);
			expect(response.status).toBeLessThan(300);
			expect(response.headers.get('access-control-allow-origin')).toBe(origin);
		},
	);

	it.each(['http://192.168.8.99:9000', ...OLD_LAN_FRONTENDS])(
		'does not allow %s',
		async (origin) => {
			const response = await preflight(origin);
			expect(response.headers.get('access-control-allow-origin')).toBeNull();
		},
	);
});
