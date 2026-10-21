// ========== Hero Service unit tests
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseService } from 'src/response/response.service';
import { HERO_DEFAULTS } from './hero.defaults';
import { Hero } from './hero.entity';
import { HeroService } from './hero.service';

const req: any = { url: 'http://localhost:9000/api/v1/hero' };

const heroRepository = {
	findOne: jest.fn(),
	create: jest.fn(),
} as unknown as typeof Hero;

const texts = {
	titlePrefix: 'Hello, I am',
	titleHighlight: 'a Mobile Developer',
	titleSuffix: '!',
	subtitle: 'I build apps.',
	buttonText: 'My GitHub',
	buttonUrl: 'https://github.com/mathius',
};

const buildService = () =>
	new HeroService(
		new ResponseService({ get: jest.fn() } as unknown as ConfigService),
		heroRepository,
	);

/** Errors are thrown as HttpExceptions; unwrap the payload. */
async function httpBody(promise: Promise<unknown>) {
	try {
		return await promise;
	} catch (err: any) {
		return err.response ?? err;
	}
}

beforeEach(() => {
	(heroRepository.findOne as jest.Mock).mockReset();
	(heroRepository.create as jest.Mock).mockReset();
});

describe('HeroService', () => {
	describe('getHero', () => {
		it('returns the current site texts while nothing was saved yet', async () => {
			(heroRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(httpBody(buildService().getHero(req))).resolves.toEqual({
				status: HttpStatus.OK,
				success: true,
				message: 'Get the hero texts',
				results: HERO_DEFAULTS,
			});
		});

		it('returns the saved texts', async () => {
			(heroRepository.findOne as jest.Mock).mockResolvedValue({
				id: 1,
				createdAt: new Date(),
				...texts,
			});

			await expect(
				httpBody(buildService().getHero(req)),
			).resolves.toMatchObject({ status: HttpStatus.OK, results: texts });
		});

		it('reports a database error as a 500', async () => {
			(heroRepository.findOne as jest.Mock).mockRejectedValue(
				new Error('db down'),
			);

			await expect(
				httpBody(buildService().getHero(req)),
			).resolves.toMatchObject({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				success: false,
				message: 'db down',
			});
		});
	});

	describe('updateHero', () => {
		it('updates the existing row', async () => {
			const row = {
				...HERO_DEFAULTS,
				update: jest.fn(function (this: any, values: object) {
					Object.assign(this, values);
					return Promise.resolve(this);
				}),
			};
			(heroRepository.findOne as jest.Mock).mockResolvedValue(row);

			const body = await httpBody(buildService().updateHero(req, texts));

			expect(row.update).toHaveBeenCalledWith(texts);
			expect(heroRepository.create).not.toHaveBeenCalled();
			expect(body).toEqual({
				status: HttpStatus.OK,
				success: true,
				message: 'The hero texts have been updated',
				results: texts,
			});
		});

		it('creates the row the first time', async () => {
			(heroRepository.findOne as jest.Mock).mockResolvedValue(null);
			(heroRepository.create as jest.Mock).mockResolvedValue({
				id: 1,
				...texts,
			});

			const body = await httpBody(buildService().updateHero(req, texts));

			expect(heroRepository.create).toHaveBeenCalledWith(texts);
			expect(body).toMatchObject({ status: HttpStatus.OK, results: texts });
		});
	});
});
