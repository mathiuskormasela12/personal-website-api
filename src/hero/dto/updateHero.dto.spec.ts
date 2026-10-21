// ========== UpdateHeroDto validation tests
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateHeroDto } from './updateHero.dto';

const valid = {
	titlePrefix: "Hi, I'm",
	titleHighlight: 'a Fullstack Developer',
	titleSuffix: '.',
	subtitle: "I'm Mathius a fullstack developer.",
	buttonText: 'My Youtube',
	buttonUrl: 'https://www.youtube.com/channel/UC5eUSF2W_vAkYA6wdilJjOw',
};

const errorsFor = async (body: object) => {
	const errors = await validate(plainToInstance(UpdateHeroDto, body));
	return errors.map((error) => error.property);
};

describe('UpdateHeroDto', () => {
	it('accepts valid texts', async () => {
		await expect(errorsFor(valid)).resolves.toEqual([]);
	});

	it('allows an empty ending', async () => {
		await expect(errorsFor({ ...valid, titleSuffix: '' })).resolves.toEqual([]);
	});

	it('trims surrounding spaces', () => {
		const dto = plainToInstance(UpdateHeroDto, {
			...valid,
			titleHighlight: '  a Mobile Developer  ',
		});
		expect(dto.titleHighlight).toBe('a Mobile Developer');
	});

	it.each([
		['titlePrefix', ''],
		['titleHighlight', '   '],
		['subtitle', ''],
		['buttonText', ''],
		['titleHighlight', 'x'.repeat(61)],
		['titleSuffix', 'x'.repeat(11)],
		['subtitle', 'x'.repeat(301)],
		['buttonText', 'x'.repeat(31)],
		['buttonUrl', 'not a url'],
		['buttonUrl', 'javascript:alert(1)'],
		['buttonUrl', 'www.youtube.com/no-protocol'],
	])('rejects %s = %p', async (field, value) => {
		await expect(errorsFor({ ...valid, [field]: value })).resolves.toEqual([
			field,
		]);
	});

	it('requires every field', async () => {
		await expect(errorsFor({})).resolves.toEqual(
			expect.arrayContaining(Object.keys(valid)),
		);
	});
});
