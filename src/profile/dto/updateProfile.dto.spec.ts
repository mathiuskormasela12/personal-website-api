import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDto } from './updateProfile.dto';

const valid = {
	skills: ['HTML', 'CSS', 'Nest Js'],
	skillsDescription: 'The tools I use for my projects.',
	facebookUrl: 'https://www.facebook.com/mathiuskormasela/',
	twitterUrl: 'https://twitter.com/Mathius87248424',
	youtubeUrl: 'https://www.youtube.com/channel/UC5eUSF2W_vAkYA6wdilJjOw',
	name: 'Mathius',
	email: 'mathiuskormasela12@gmail.com',
	phone: '+628111906204',
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

	it('trims the name, the email and the phone', () => {
		const dto = plainToInstance(UpdateProfileDto, {
			...valid,
			name: '  Mathius ',
			email: ' me@example.com ',
			phone: ' +819012345678 ',
		});
		expect(dto.name).toBe('Mathius');
		expect(dto.email).toBe('me@example.com');
		expect(dto.phone).toBe('+819012345678');
	});

	it.each(['email', 'phone'])(
		'allows an empty %s so it can be hidden',
		async (field) => {
			await expect(errorsFor({ ...valid, [field]: '' })).resolves.toEqual([]);
		},
	);

	it.each(['+819012345678', '+6591234567', '+12025550123'])(
		'accepts the real phone number %s',
		async (phone) => {
			await expect(errorsFor({ ...valid, phone })).resolves.toEqual([]);
		},
	);

	it('accepts a name of exactly 30 characters', async () => {
		await expect(
			errorsFor({ ...valid, name: 'x'.repeat(30) }),
		).resolves.toEqual([]);
	});

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
		['name', '   ', "Your name can't be empty"],
		['name', 'x'.repeat(31), 'Your name is too long (max 30)'],
		['name', 7, 'Your name should be a text'],
		['email', 'mathius@gmail', "The email doesn't look right"],
		['email', 'mathius gmail.com', "The email doesn't look right"],
		[
			'email',
			`${'a'.repeat(60)}@${'b'.repeat(60)}.${'c'.repeat(60)}.${'d'.repeat(60)}.${'e'.repeat(20)}.com`,
			'The email is too long (max 255)',
		],
		[
			'phone',
			'08111906204',
			'The phone number should start with + and the country code',
		],
		[
			'phone',
			'+62 811 1906 204',
			'The phone number should start with + and the country code',
		],
		['phone', '+62123456', "The phone number doesn't look right"],
		['phone', '+11234567890', "The phone number doesn't look right"],
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
