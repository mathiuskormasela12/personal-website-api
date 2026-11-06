// ========== Project service: replacing the old image on update
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { ProjectService } from './project.service';

jest.mock('fs', () => ({
	...jest.requireActual('fs'),
	existsSync: jest.fn(),
	unlinkSync: jest.fn(),
}));

const mockedExistsSync = existsSync as jest.Mock;
const mockedUnlinkSync = unlinkSync as jest.Mock;
const OLD_IMAGE = 'old-1700000000000.jpg';
const NEW_IMAGE = 'new-1700000000001.jpg';
const OLD_PATH = join(__dirname, '../../uploads/' + OLD_IMAGE);
const dto = {
	title: 'Kasir Warung',
	description: 'A point of sale app.',
	technologies: 'react, jest',
};

const buildService = (findByPkImg: string | null = OLD_IMAGE) => {
	const responseService = {
		response: jest.fn((body: unknown) => body),
		responseGenerator: jest.fn(
			(_req: unknown, status: number, success: boolean, message: string) => ({
				status,
				success,
				message,
			}),
		),
	};
	const uploadService = {
		uploadImage: jest.fn(() => ({
			status: 200,
			success: true,
			img: NEW_IMAGE,
		})),
	};
	const technologiesService = { createTechnologies: jest.fn() };
	const projectsRepository = {
		findByPk: jest.fn(() =>
			Promise.resolve(findByPkImg === null ? null : { img: findByPkImg }),
		),
		update: jest.fn(() => Promise.resolve([1])),
	};
	const technologiesRepository = { destroy: jest.fn(() => Promise.resolve(0)) };
	const service = new ProjectService(
		responseService as never,
		uploadService as never,
		{} as never,
		technologiesService as never,
		projectsRepository as never,
		technologiesRepository as never,
	);
	return {
		service,
		responseService,
		uploadService,
		technologiesService,
		projectsRepository,
		technologiesRepository,
	};
};

const runUpdate = async (
	service: ProjectService,
	img: Express.Multer.File | undefined,
) => {
	try {
		await service.updateProject({} as never, img as never, dto, 1);
		return undefined;
	} catch (thrown) {
		return thrown as { status: number; success: boolean; message: string };
	}
};

const newFile = { originalname: 'new.jpg' } as Express.Multer.File;

beforeEach(() => {
	jest.clearAllMocks();
	mockedExistsSync.mockReturnValue(true);
});

describe('ProjectService.updateProject: replacing the old image', () => {
	it('saves the new image and removes the old image file', async () => {
		const { service, projectsRepository } = buildService();

		const result = await runUpdate(service, newFile);

		expect(projectsRepository.update).toHaveBeenCalledWith(
			expect.objectContaining({ img: NEW_IMAGE }),
			{ where: { id: 1 } },
		);
		expect(mockedUnlinkSync).toHaveBeenCalledWith(OLD_PATH);
		expect(result).toMatchObject({ success: true });
	});

	it('still saves the title and technologies when the old file is already missing', async () => {
		mockedExistsSync.mockReturnValue(false);
		const { service, technologiesService } = buildService();

		const result = await runUpdate(service, newFile);

		expect(mockedUnlinkSync).not.toHaveBeenCalled();
		expect(technologiesService.createTechnologies).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject({
			success: true,
			message: 'The project has been updated',
		});
	});

	it('saves the project data before it removes the old file', async () => {
		const { service, projectsRepository } = buildService();

		await runUpdate(service, newFile);

		const savedAt = projectsRepository.update.mock.invocationCallOrder[0];
		const removedAt = mockedUnlinkSync.mock.invocationCallOrder[0];
		expect(savedAt).toBeLessThan(removedAt);
	});

	it('keeps the update when the old file cannot be removed', async () => {
		mockedUnlinkSync.mockImplementationOnce(() => {
			throw new Error('EACCES: permission denied');
		});
		const { service, technologiesService } = buildService();

		const result = await runUpdate(service, newFile);

		expect(technologiesService.createTechnologies).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject({ success: true });
	});

	it('keeps the current image file when no new image is sent', async () => {
		const { service, uploadService, technologiesService } = buildService();

		const result = await runUpdate(service, undefined);

		expect(uploadService.uploadImage).not.toHaveBeenCalled();
		expect(mockedUnlinkSync).not.toHaveBeenCalled();
		expect(technologiesService.createTechnologies).toHaveBeenCalledTimes(1);
		expect(result).toMatchObject({ success: true });
	});
});
