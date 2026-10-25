import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../app.module';
import { configureApp } from '../main';
import { PROFILE_DEFAULTS } from './profile.defaults';
import { Profile } from './profile.entity';

const PORT = 9150;
const url = `http://127.0.0.1:${PORT}/api/v1/profile`;

const profile = {
	skills: ['React', 'Nest Js', 'Docker'],
	skillsDescription: 'Mostly TypeScript.',
	facebookUrl: '',
	twitterUrl: 'https://twitter.com/Mathius87248424',
	youtubeUrl: 'https://www.youtube.com/@mathius',
};

describe('/api/v1/profile (integration)', () => {
	let app: INestApplication;
	let stored: Record<string, unknown> | null = null;
	const profileModel = {
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
			.useValue(profileModel)
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
			results: PROFILE_DEFAULTS,
		});
	});

	it('PATCH without a token is forbidden', async () => {
		const response = await patch(profile);
		expect(response.status).toBe(403);
		expect(profileModel.create).not.toHaveBeenCalled();
	});

	it('PATCH rejects duplicate skills with the API error shape', async () => {
		const response = await patch(
			{ ...profile, skills: ['React', 'react'] },
			{ 'x-access-token': token() },
		);
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			status: 400,
			success: false,
			message: 'Each skill can only be added once',
		});
		expect(profileModel.create).not.toHaveBeenCalled();
	});

	it('PATCH with a token saves the profile, and GET returns it', async () => {
		const response = await patch(
			{ ...profile, skills: [' React', 'Nest Js ', 'Docker'], extra: 'x' },
			{ 'x-access-token': token() },
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			success: true,
			results: profile,
		});
		expect(profileModel.create).toHaveBeenCalledWith(profile);

		const after = await fetch(url);
		expect((await after.json()).results).toEqual(profile);
	});
});
