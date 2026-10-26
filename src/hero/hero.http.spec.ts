// ========== Hero endpoints over real HTTP (AppModule booted, DB stubbed)
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { Profile } from '../profile/profile.entity';
import { AppModule } from '../app.module';
import { configureApp } from '../main';
import { HERO_DEFAULTS } from './hero.defaults';
import { Hero } from './hero.entity';

const PORT = 9149;
const url = `http://127.0.0.1:${PORT}/api/v1/hero`;

const texts = {
	titlePrefix: 'Hello, I am',
	titleHighlight: 'a Mobile Developer',
	titleSuffix: '!',
	subtitle: 'I build apps.',
	buttonText: 'My GitHub',
	buttonUrl: 'https://github.com/mathius',
};

describe('/api/v1/hero (integration)', () => {
	let app: INestApplication;
	let stored: Record<string, unknown> | null = null;
	const heroModel = {
		findOne: jest.fn(async () =>
			stored
				? {
						...stored,
						update: async (values: object) =>
							(stored = { ...stored, ...values }),
					}
				: null,
		),
		create: jest.fn(async (values: object) => (stored = { ...values })),
	};

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
			.overrideProvider(Sequelize)
			.useValue({ define: jest.fn(), authenticate: jest.fn() })
			.overrideProvider(getModelToken(Profile))
			.useValue({ sync: jest.fn() })
			.overrideProvider(getModelToken(Hero))
			.useValue(heroModel)
			.compile();
		app = configureApp(moduleRef.createNestApplication());
		await app.listen(PORT, '127.0.0.1');
	}, 30000);

	afterAll(async () => {
		await app.close();
	});

	const token = () =>
		new JwtService().sign(
			{ id: 1 },
			{ secret: process.env.JWT_ACCESS_TOKEN_SECRET_KEY, expiresIn: '1h' },
		);

	const patch = (body: object, headers: Record<string, string> = {}) =>
		fetch(url, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json', ...headers },
			body: JSON.stringify(body),
		});

	it('GET is public and returns the defaults before anything is saved', async () => {
		const response = await fetch(url);
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			success: true,
			results: HERO_DEFAULTS,
		});
	});

	it('PATCH without a token is forbidden', async () => {
		const response = await patch(texts);
		expect(response.status).toBe(403);
		expect(heroModel.create).not.toHaveBeenCalled();
	});

	it('PATCH rejects invalid texts with the API error shape', async () => {
		const response = await patch(
			{ ...texts, buttonUrl: 'javascript:alert(1)' },
			{ 'x-access-token': token() },
		);
		expect(response.status).toBe(400);
		expect(await response.json()).toMatchObject({
			status: 400,
			success: false,
		});
	});

	it('PATCH with a token saves the texts, and GET returns them', async () => {
		const response = await patch(
			{ ...texts, titleHighlight: '  a Mobile Developer ' },
			{ 'x-access-token': token() },
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			success: true,
			results: texts,
		});

		const after = await fetch(url);
		expect(await after.json()).toMatchObject({ results: texts });
	});
});
