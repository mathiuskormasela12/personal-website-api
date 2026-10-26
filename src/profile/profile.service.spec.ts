import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseService } from 'src/response/response.service';
import { PROFILE_DEFAULTS } from './profile.defaults';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';

const req: any = { url: 'http://localhost:9000/api/v1/profile' };

const profileRepository = {
	findOne: jest.fn(),
	create: jest.fn(),
	sync: jest.fn(),
} as unknown as typeof Profile;

const profile = {
	skills: ['React', 'Nest Js'],
	skillsDescription: 'Mostly TypeScript.',
	facebookUrl: '',
	twitterUrl: 'https://twitter.com/Mathius87248424',
	youtubeUrl: 'https://www.youtube.com/@mathius',
	name: 'Mathius K',
	email: 'me@example.com',
	phone: '+819012345678',
};

const buildService = () =>
	new ProfileService(
		new ResponseService({ get: jest.fn() } as unknown as ConfigService),
		profileRepository,
	);

async function httpBody(promise: Promise<unknown>) {
	try {
		return await promise;
	} catch (err: any) {
		return err.response ?? err;
	}
}

beforeEach(() => {
	(profileRepository.findOne as jest.Mock).mockReset();
	(profileRepository.create as jest.Mock).mockReset();
	(profileRepository.sync as jest.Mock).mockReset();
});

describe('PROFILE_DEFAULTS', () => {
	it('keeps the skills and links the footer showed before they became editable', () => {
		expect(PROFILE_DEFAULTS).toEqual({
			skills: [
				'HTML',
				'CSS',
				'Javascript',
				'Typescript',
				'Node Js',
				'Express Js',
				'Nest Js',
				'MySQL',
				'Mongodb',
			],
			skillsDescription:
				'The languages, frameworks and databases I use for my projects.',
			facebookUrl: 'https://www.facebook.com/mathiuskormasela/',
			twitterUrl: 'https://twitter.com/Mathius87248424',
			youtubeUrl:
				'https://www.youtube.com/channel/UC5eUSF2W_vAkYA6wdilJjOw/videos',
			name: 'Mathius',
			email: 'mathiuskormasela12@gmail.com',
			phone: '+628111906204',
		});
	});
});

describe('ProfileService', () => {
	it('adds new profile columns to the existing table when the API starts', async () => {
		await buildService().onModuleInit();
		expect(profileRepository.sync).toHaveBeenCalledWith({ alter: true });
	});

	describe('getProfile', () => {
		it('fills columns that an older saved row does not have yet with the defaults', async () => {
			(profileRepository.findOne as jest.Mock).mockResolvedValue({
				...profile,
				name: null,
				email: null,
				phone: null,
			});

			const body: any = await httpBody(buildService().getProfile(req));

			expect(body.results).toEqual({
				...profile,
				name: PROFILE_DEFAULTS.name,
				email: PROFILE_DEFAULTS.email,
				phone: PROFILE_DEFAULTS.phone,
			});
		});

		it('keeps an email or phone that was saved empty on purpose', async () => {
			(profileRepository.findOne as jest.Mock).mockResolvedValue({
				...profile,
				email: '',
				phone: '',
			});

			const body: any = await httpBody(buildService().getProfile(req));

			expect(body.results).toMatchObject({ email: '', phone: '' });
		});

		it('returns the defaults while nothing was saved yet', async () => {
			(profileRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(httpBody(buildService().getProfile(req))).resolves.toEqual({
				status: HttpStatus.OK,
				success: true,
				message: 'Get the profile',
				results: PROFILE_DEFAULTS,
			});
		});

		it('returns a copy of the defaults, so callers cannot change them', async () => {
			(profileRepository.findOne as jest.Mock).mockResolvedValue(null);

			const body: any = await httpBody(buildService().getProfile(req));
			body.results.skills.push('Changed');

			expect(PROFILE_DEFAULTS.skills).not.toContain('Changed');
		});

		it('returns only the profile fields of the saved row', async () => {
			(profileRepository.findOne as jest.Mock).mockResolvedValue({
				id: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
				...profile,
			});

			await expect(httpBody(buildService().getProfile(req))).resolves.toEqual({
				status: HttpStatus.OK,
				success: true,
				message: 'Get the profile',
				results: profile,
			});
		});

		it('reads the first row', async () => {
			(profileRepository.findOne as jest.Mock).mockResolvedValue(null);
			await buildService().getProfile(req);
			expect(profileRepository.findOne).toHaveBeenCalledWith({
				order: [['id', 'ASC']],
			});
		});

		it('reports a database error as a 500', async () => {
			(profileRepository.findOne as jest.Mock).mockRejectedValue(
				new Error('db down'),
			);

			await expect(
				httpBody(buildService().getProfile(req)),
			).resolves.toMatchObject({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				success: false,
				message: 'db down',
			});
		});
	});

	describe('updateProfile', () => {
		it('updates the existing row', async () => {
			const row = {
				...PROFILE_DEFAULTS,
				update: jest.fn(function (this: any, values: object) {
					Object.assign(this, values);
					return Promise.resolve(this);
				}),
			};
			(profileRepository.findOne as jest.Mock).mockResolvedValue(row);

			const body = await httpBody(buildService().updateProfile(req, profile));

			expect(row.update).toHaveBeenCalledWith(profile);
			expect(profileRepository.create).not.toHaveBeenCalled();
			expect(body).toEqual({
				status: HttpStatus.OK,
				success: true,
				message: 'The profile has been updated',
				results: profile,
			});
		});

		it('creates the row the first time', async () => {
			(profileRepository.findOne as jest.Mock).mockResolvedValue(null);
			(profileRepository.create as jest.Mock).mockResolvedValue({
				id: 1,
				...profile,
			});

			const body = await httpBody(buildService().updateProfile(req, profile));

			expect(profileRepository.create).toHaveBeenCalledWith(profile);
			expect(body).toMatchObject({ status: HttpStatus.OK, results: profile });
		});

		it('reports a database error as a 500', async () => {
			(profileRepository.findOne as jest.Mock).mockRejectedValue(
				new Error('db down'),
			);

			await expect(
				httpBody(buildService().updateProfile(req, profile)),
			).resolves.toMatchObject({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				success: false,
			});
		});
	});
});
