import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDto } from './updateProfile.dto';

const valid = {
	skills: ['HTML', 'CSS', 'Nest Js'],
	skillsDescription: 'The tools I use for my projects.',
	facebookUrl: 'https://www.facebook.com/mathiuskormasela/',
	twitterUrl: 'https://twitter.com/Mathius87248424',
	youtubeUrl: 'https://www.youtube.com/channel/UC5eUSF2W_vAkYA6wdilJjOw',
};

const errorsFor = async (body: object) => {
	const errors = await validate(plainToInstance(UpdateProfileDto, body));
	return errors.map((error) => error.property);
};

const messagesFor = async (body: object) => {
	const errors = await validate(plainToInstance(UpdateProfileDto, body));
	return errors.flatMap((error) => Object.values(error.constraints ?? {}));
};

describe('UpdateProfileDto', () => {
	it('accepts a valid profile', async () => {
		await expect(errorsFor(valid)).resolves.toEqual([]);
	});

	it('trims every skill and the description', () => {
		const dto = plainToInstance(UpdateProfileDto, {
			...valid,
			skills: ['  React ', 'Node Js  '],
			skillsDescription: '  Hello  ',
		});
		expect(dto.skills).toEqual(['React', 'Node Js']);
		expect(dto.skillsDescription).toBe('Hello');
	});

	it.each(['facebookUrl', 'twitterUrl', 'youtubeUrl'])(
		'allows an empty %s so its icon can be hidden',
		async (field) => {
			await expect(errorsFor({ ...valid, [field]: '' })).resolves.toEqual([]);
		},
	);

	it('accepts exactly 24 skills of 30 characters', async () => {
		const skills = Array.from({ length: 24 }, (_, i) => `${i}`.padEnd(30, 'x'));
		await expect(errorsFor({ ...valid, skills })).resolves.toEqual([]);
	});

	it.each([
		['skills', [], 'Add at least one skill'],
		[
			'skills',
			Array.from({ length: 25 }, (_, i) => `Skill ${i}`),
			'You can add up to 24 skills',
		],
		['skills', ['React', '   '], "A skill can't be empty"],
		['skills', ['x'.repeat(31)], 'A skill is too long (max 30)'],
		['skills', ['React', 'react '], 'Each skill can only be added once'],
		['skills', 'React', 'The skills should be a list'],
		['skills', ['React', 3], 'A skill should be a text'],
		['skillsDescription', '  ', "The description can't be empty"],
		[
			'skillsDescription',
			'x'.repeat(301),
			'The description is too long (max 300)',
		],
		[
			'facebookUrl',
			'facebook.com/no-protocol',
			'The Facebook link should be a http(s) URL',
		],
		[
			'twitterUrl',
			'javascript:alert(1)',
			'The Twitter link should be a http(s) URL',
		],
		['youtubeUrl', 'not a url', 'The Youtube link should be a http(s) URL'],
		[
			'youtubeUrl',
			`https://youtube.com/${'x'.repeat(236)}`,
			'The Youtube link is too long (max 255)',
		],
	])('rejects %s = %p', async (field, value, message) => {
		const body = { ...valid, [field]: value };
		await expect(errorsFor(body)).resolves.toEqual([field]);
		await expect(messagesFor(body)).resolves.toContain(message);
	});

	it('requires every field', async () => {
		await expect(errorsFor({})).resolves.toEqual(
			expect.arrayContaining(Object.keys(valid)),
		);
	});
});
