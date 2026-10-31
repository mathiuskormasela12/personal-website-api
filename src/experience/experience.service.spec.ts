import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseService } from 'src/response/response.service';
import { CreateOrUpdateExperienceDto } from './dto';
import { Experience } from './experience.entity';
import {
	ExperienceService,
	findDateProblem,
	getCurrentMonth,
	sortExperiences,
} from './experience.service';

const req: any = { url: 'http://localhost:9000/api/v1/experience' };

const experienceRepository = {
	findAll: jest.fn(),
	findByPk: jest.fn(),
	create: jest.fn(),
	update: jest.fn(),
	sync: jest.fn(),
	getTableName: jest.fn(() => 'Experiences'),
	sequelize: {
		getQueryInterface: () => ({
			describeTable: jest.fn(async () => ({ description: { type: 'JSON' } })),
		}),
	},
} as unknown as typeof Experience;

const dto: CreateOrUpdateExperienceDto = {
	company: 'Nimbus Labs',
	role: 'Mobile Developer',
	startDate: '2024-03',
	endDate: '2025-02',
	description: ['Shipped the driver app.'],
};

const row = (values: Partial<Record<string, unknown>> = {}) => ({
	id: 1,
	...dto,
	createdAt: new Date(),
	updatedAt: new Date(),
	...values,
});

const buildService = () =>
	new ExperienceService(
		new ResponseService({ get: jest.fn() } as unknown as ConfigService),
		experienceRepository,
	);

async function httpBody(promise: Promise<unknown>) {
	try {
		return await promise;
	} catch (err: any) {
		return err.response ?? err;
	}
}

beforeEach(() => {
	jest.useFakeTimers().setSystemTime(new Date('2026-10-15T00:00:00Z'));
	(experienceRepository.findAll as jest.Mock).mockReset();
	(experienceRepository.findByPk as jest.Mock).mockReset();
	(experienceRepository.create as jest.Mock).mockReset();
	(experienceRepository.update as jest.Mock).mockReset();
	(experienceRepository.sync as jest.Mock).mockReset();
});

afterEach(() => {
	jest.useRealTimers();
});

describe('getCurrentMonth', () => {
	it('returns the year and month as YYYY-MM', () => {
		expect(getCurrentMonth(new Date('2026-01-31T23:00:00Z'))).toBe('2026-01');
	});
});

describe('findDateProblem', () => {
	it('accepts a finished job and a current job', () => {
		expect(findDateProblem(dto, '2026-10')).toBeNull();
		expect(findDateProblem({ ...dto, endDate: null }, '2026-10')).toBeNull();
	});

	it('accepts a job that started and ended in the same month', () => {
		expect(
			findDateProblem(
				{ ...dto, startDate: '2026-10', endDate: '2026-10' },
				'2026-10',
			),
		).toBeNull();
	});

	it('rejects an end date before the start date', () => {
		expect(
			findDateProblem(
				{ ...dto, startDate: '2025-03', endDate: '2025-02' },
				'2026-10',
			),
		).toBe("The end date can't be before the start date");
	});

	it('rejects dates in the future', () => {
		expect(
			findDateProblem(
				{ ...dto, startDate: '2026-11', endDate: null },
				'2026-10',
			),
		).toBe("The start date can't be in the future");
		expect(findDateProblem({ ...dto, endDate: '2026-11' }, '2026-10')).toBe(
			"The end date can't be in the future",
		);
	});
});

describe('sortExperiences', () => {
	it('puts current jobs first, then the newest start date', () => {
		const sorted = sortExperiences([
			{ ...row({ id: 1, startDate: '2021-08', endDate: '2022-05' }) },
			{ ...row({ id: 2, startDate: '2024-03', endDate: '2025-02' }) },
			{ ...row({ id: 3, startDate: '2023-01', endDate: null }) },
			{ ...row({ id: 4, startDate: '2025-03', endDate: null }) },
		] as any);
		expect(sorted.map((item) => item.id)).toEqual([4, 3, 2, 1]);
	});

	it('shows the newest entry first when two start in the same month', () => {
		const sorted = sortExperiences([
			row({ id: 1, startDate: '2024-03' }),
			row({ id: 2, startDate: '2024-03' }),
		] as any);
		expect(sorted.map((item) => item.id)).toEqual([2, 1]);
	});
});

describe('ExperienceService', () => {
	it('returns every experience sorted, with only the public fields', async () => {
		(experienceRepository.findAll as jest.Mock).mockResolvedValue([
			row({ id: 1, startDate: '2021-08', endDate: '2022-05' }),
			row({ id: 2, startDate: '2025-03', endDate: null }),
		]);
		const body: any = await buildService().getExperiences();
		expect(body).toMatchObject({
			status: HttpStatus.OK,
			success: true,
			message: 'Get all experiences',
		});
		expect(body.results.map((item: any) => item.id)).toEqual([2, 1]);
		expect(Object.keys(body.results[0]).sort()).toEqual(
			['company', 'description', 'endDate', 'id', 'role', 'startDate'].sort(),
		);
	});

	it('returns an empty list when there is nothing yet', async () => {
		(experienceRepository.findAll as jest.Mock).mockResolvedValue([]);
		const body: any = await buildService().getExperiences();
		expect(body.results).toEqual([]);
	});

	it('creates an experience and returns it', async () => {
		(experienceRepository.create as jest.Mock).mockResolvedValue(
			row({ id: 7 }),
		);
		const body: any = await buildService().createExperience(req, dto);
		expect(experienceRepository.create).toHaveBeenCalledWith(dto);
		expect(body).toMatchObject({
			status: HttpStatus.CREATED,
			success: true,
			message: 'The experience has been added',
			results: { id: 7, company: 'Nimbus Labs' },
		});
	});

	it('does not save when the dates are wrong', async () => {
		const body: any = await httpBody(
			buildService().createExperience(req, { ...dto, endDate: '2023-01' }),
		);
		expect(body).toEqual({
			status: HttpStatus.BAD_REQUEST,
			success: false,
			message: "The end date can't be before the start date",
		});
		expect(experienceRepository.create).not.toHaveBeenCalled();
	});

	it('updates an existing experience', async () => {
		const update = jest.fn(async (values: object) => row({ id: 3, ...values }));
		(experienceRepository.findByPk as jest.Mock).mockResolvedValue({ update });
		const body: any = await buildService().updateExperience(req, 3, {
			...dto,
			endDate: null,
		});
		expect(experienceRepository.findByPk).toHaveBeenCalledWith(3);
		expect(update).toHaveBeenCalledWith({ ...dto, endDate: null });
		expect(body).toMatchObject({
			status: HttpStatus.OK,
			message: 'The experience has been updated',
			results: { id: 3, endDate: null },
		});
	});

	it('deletes an existing experience', async () => {
		const destroy = jest.fn();
		(experienceRepository.findByPk as jest.Mock).mockResolvedValue({ destroy });
		const body: any = await buildService().deleteExperience(req, 3);
		expect(destroy).toHaveBeenCalled();
		expect(body).toEqual({
			status: HttpStatus.OK,
			success: true,
			message: 'The experience has been deleted',
		});
	});

	it.each([
		[
			'update',
			(service: ExperienceService) => service.updateExperience(req, 99, dto),
		],
		[
			'delete',
			(service: ExperienceService) => service.deleteExperience(req, 99),
		],
	])('answers 404 when trying to %s an unknown experience', async (_, call) => {
		(experienceRepository.findByPk as jest.Mock).mockResolvedValue(null);
		expect(await httpBody(call(buildService()))).toEqual({
			status: HttpStatus.NOT_FOUND,
			success: false,
			message: 'The experience is not found',
		});
	});

	it('on start, checks for old descriptions and then updates the table', async () => {
		await buildService().onModuleInit();
		expect(experienceRepository.update).not.toHaveBeenCalled();
		expect(experienceRepository.sync).toHaveBeenCalledWith({ alter: true });
	});

	it('always returns the description as a list, even an old text one', async () => {
		(experienceRepository.findAll as jest.Mock).mockResolvedValue([
			row({ id: 1, description: 'First line\nSecond line' }),
		]);
		const body: any = await buildService().getExperiences();
		expect(body.results[0].description).toEqual(['First line', 'Second line']);
	});

	it('turns a database error into a 500 with the error message', async () => {
		(experienceRepository.findAll as jest.Mock).mockRejectedValue(
			new Error('db is down'),
		);
		expect(await httpBody(buildService().getExperiences())).toEqual({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			success: false,
			message: 'db is down',
		});
	});
});
