import { Experience } from './experience.entity';

export const toDescriptionPoints = (value: unknown): string[] => {
	if (Array.isArray(value)) {
		return value.map((point) => String(point).trim()).filter(Boolean);
	}

	if (typeof value !== 'string') {
		return [];
	}

	return value
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
};

export const migrateExperienceDescriptions = async (
	experienceRepository: typeof Experience,
): Promise<number> => {
	const queryInterface = experienceRepository.sequelize.getQueryInterface();
	const columns = await queryInterface.describeTable(
		experienceRepository.getTableName(),
	);
	const type = String(columns.description?.type ?? '').toUpperCase();

	if (type !== 'TEXT') {
		return 0;
	}

	const rows = (await experienceRepository.findAll({
		attributes: ['id', 'description'],
		raw: true,
	})) as unknown as { id: number; description: unknown }[];

	for (const row of rows) {
		await experienceRepository.update(
			{ description: toDescriptionPoints(row.description) },
			{ where: { id: row.id } },
		);
	}

	return rows.length;
};
