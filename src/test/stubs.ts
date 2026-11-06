export const experienceModelStub = <T extends object>(model: T = {} as T) => ({
	sync: jest.fn(),
	getTableName: jest.fn(() => 'Experiences'),
	sequelize: {
		getQueryInterface: () => ({
			describeTable: jest.fn(async () => ({
				description: { type: 'JSON' },
			})),
		}),
	},
	...model,
});
