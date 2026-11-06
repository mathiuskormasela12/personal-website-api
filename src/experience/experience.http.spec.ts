import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../app.module';
import { configureApp } from '../main';
import { Profile } from '../profile/profile.entity';
import { Experience } from './experience.entity';
import { experienceModelStub } from '../test/stubs';

const PORT = 9160;
const base = `http://127.0.0.1:${PORT}/api/v1`;

const experience = {
	company: 'Nimbus Labs',
	role: 'Senior Mobile Developer',
	startDate: '2025-03',
	endDate: null,
	description: ['Lead the React Native app.', 'Rebuilt offline sync.'],
};

describe('/api/v1/experience (integration)', () => {
	let app: INestApplication;
	let rows: Record<string, any>[] = [];
	let nextId = 1;

	const asInstance = (stored: Record<string, any>) => ({
		...stored,
		update: async (values: object) => {
			Object.assign(stored, values);
			return { ...stored };
		},
		destroy: async () => {
			rows = rows.filter((item) => item !== stored);
		},
	});

	const experienceModel = experienceModelStub({
		findAll: jest.fn(async () => rows.map((item) => ({ ...item }))),
		findByPk: jest.fn(async (id: number) => {
			const stored = rows.find((item) => item.id === id);
			return stored ? asInstance(stored) : null;
		}),
		create: jest.fn(async (values: object) => {
			const stored = { id: nextId++, ...values };
			rows.push(stored);
			return { ...stored };
		}),
	});

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
			.overrideProvider(Sequelize)
			.useValue({
				define: jest.fn(),
				authenticate: jest.fn(),
				close: jest.fn(),
			})
			.overrideProvider(getModelToken(Profile))
			.useValue({ sync: jest.fn() })
			.overrideProvider(getModelToken(Experience))
			.useValue(experienceModel)
			.compile();
		app = configureApp(moduleRef.createNestApplication());
		await app.listen(PORT, '127.0.0.1');
	}, 30000);

	afterAll(async () => {
		await app.close();
	});

	beforeEach(() => {
		rows = [];
		nextId = 1;
		jest.clearAllMocks();
	});

	const token = () =>
		new JwtService().sign(
			{ id: 1 },
			{ secret: process.env.JWT_ACCESS_TOKEN_SECRET_KEY, expiresIn: '1h' },
		);

	const send = (
		method: string,
		path: string,
		body?: object,
		withToken = true,
	) =>
		fetch(`${base}/${path}`, {
			method,
			headers: {
				'content-type': 'application/json',
				...(withToken ? { 'x-access-token': token() } : {}),
			},
			body: body ? JSON.stringify(body) : undefined,
		});

	it('GET /experiences is public and returns an empty list at first', async () => {
		const response = await fetch(`${base}/experiences`);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			status: 200,
			success: true,
			message: 'Get all experiences',
			results: [],
		});
	});

	it.each([
		['POST', 'experience'],
		['PATCH', 'experience/1'],
		['DELETE', 'experience/1'],
	])('%s %s without a token is forbidden', async (method, path) => {
		const response = await send(method, path, experience, false);
		expect(response.status).toBe(403);
		expect(experienceModel.create).not.toHaveBeenCalled();
	});

	it('POST trims the text, saves it, and GET returns it', async () => {
		const response = await send('POST', 'experience', {
			...experience,
			company: '  Nimbus Labs ',
			description: [' Lead the React Native app. ', 'Rebuilt offline sync.'],
			extra: 'ignored',
		});
		expect(response.status).toBe(201);
		expect(await response.json()).toMatchObject({
			success: true,
			message: 'The experience has been added',
			results: { id: 1, ...experience },
		});
		expect(experienceModel.create).toHaveBeenCalledWith(experience);

		const list = await (await fetch(`${base}/experiences`)).json();
		expect(list.results).toEqual([{ id: 1, ...experience }]);
	});

	it('POST treats an empty end date as "still working here"', async () => {
		const response = await send('POST', 'experience', {
			...experience,
			endDate: '',
		});
		expect(response.status).toBe(201);
		expect((await response.json()).results.endDate).toBeNull();
	});

	it.each([
		[{ company: '' }, "The company name can't be empty"],
		[{ role: 'x'.repeat(61) }, 'The role is too long (max 60)'],
		[{ startDate: '2025-13' }, 'The start date should look like 2025-03'],
		[{ endDate: 'March 2025' }, 'The end date should look like 2025-03'],
		[{ description: [] }, 'Add at least one point'],
		[{ description: ['One', '   '] }, "A point can't be empty"],
		[{ description: ['x'.repeat(201)] }, 'A point is too long (max 200)'],
		[
			{ description: Array.from({ length: 11 }, (_, i) => `Point ${i}`) },
			'You can add up to 10 points',
		],
		[{ description: 'One line' }, 'The description should be a list of points'],
		[{ description: ['One', 2] }, 'A point should be a text'],
		[
			{ startDate: '2025-03', endDate: '2025-01' },
			"The end date can't be before the start date",
		],
	])('POST rejects %j with a clear message', async (change, message) => {
		const response = await send('POST', 'experience', {
			...experience,
			...change,
		});
		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			status: 400,
			success: false,
			message,
		});
		expect(experienceModel.create).not.toHaveBeenCalled();
	});

	it('PATCH updates an experience', async () => {
		await send('POST', 'experience', experience);
		const response = await send('PATCH', 'experience/1', {
			...experience,
			endDate: '2026-01',
		});
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			message: 'The experience has been updated',
			results: { id: 1, endDate: '2026-01' },
		});
	});

	it('DELETE removes an experience', async () => {
		await send('POST', 'experience', experience);
		const response = await send('DELETE', 'experience/1');
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			status: 200,
			success: true,
			message: 'The experience has been deleted',
		});
		const list = await (await fetch(`${base}/experiences`)).json();
		expect(list.results).toEqual([]);
	});

	it.each([
		['PATCH', experience],
		['DELETE', undefined],
	])('%s answers 404 for an unknown id', async (method, body) => {
		const response = await send(method, 'experience/42', body);
		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({
			status: 404,
			success: false,
			message: 'The experience is not found',
		});
	});

	it('answers 400 when the id is not a number', async () => {
		const response = await send('DELETE', 'experience/abc');
		expect(response.status).toBe(400);
	});
});
