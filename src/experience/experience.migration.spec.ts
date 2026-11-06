import { Experience } from './experience.entity';
import {
	migrateExperienceDescriptions,
	toDescriptionPoints,
} from './experience.migration';

const buildModel = (type: string | null, rows: object[] = []) => {
	const update = jest.fn();
	const findAll = jest.fn(async () => rows);
	const columns = type === null ? {} : { description: { type } };
	const model = {
		getTableName: () => 'Experiences',
		findAll,
		update,
		sequelize: {
			getQueryInterface: () => ({
				describeTable: jest.fn(async () => columns),
			}),
		},
	} as unknown as typeof Experience;
	return { model, update, findAll };
};

describe('toDescriptionPoints', () => {
	it('turns each non-empty line of old text into one point', () => {
		expect(toDescriptionPoints('  First line \n\n Second line\n')).toEqual([
			'First line',
			'Second line',
		]);
	});

	it('cleans a list that is already a list', () => {
		expect(toDescriptionPoints([' One ', '', 'Two'])).toEqual(['One', 'Two']);
	});

	it('returns an empty list for anything else', () => {
		expect(toDescriptionPoints(null)).toEqual([]);
		expect(toDescriptionPoints(undefined)).toEqual([]);
		expect(toDescriptionPoints(42)).toEqual([]);
	});
});

describe('migrateExperienceDescriptions', () => {
	it('converts every old text description into a list', async () => {
		const { model, update } = buildModel('TEXT', [
			{ id: 1, description: 'Built dashboards\nOwned payments' },
			{ id: 2, description: 'Shipped the app' },
		]);
		await expect(migrateExperienceDescriptions(model)).resolves.toBe(2);
		expect(update).toHaveBeenNthCalledWith(
			1,
			{ description: ['Built dashboards', 'Owned payments'] },
			{ where: { id: 1 } },
		);
		expect(update).toHaveBeenNthCalledWith(
			2,
			{ description: ['Shipped the app'] },
			{ where: { id: 2 } },
		);
	});

	it.each([['JSON'], ['LONGTEXT'], [null]])(
		'does nothing when the column is %s (already converted or missing)',
		async (type) => {
			const { model, update, findAll } = buildModel(type);
			await expect(migrateExperienceDescriptions(model)).resolves.toBe(0);
			expect(findAll).not.toHaveBeenCalled();
			expect(update).not.toHaveBeenCalled();
		},
	);

	it('works with a lower-case column type', async () => {
		const { model, update } = buildModel('text', [
			{ id: 1, description: 'One' },
		]);
		await migrateExperienceDescriptions(model);
		expect(update).toHaveBeenCalledWith(
			{ description: ['One'] },
			{ where: { id: 1 } },
		);
	});
});
