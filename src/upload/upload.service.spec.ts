// ========== Upload Service unit tests (fs is mocked — nothing is written to disk)
jest.mock('fs', () => ({
	existsSync: jest.fn(() => true),
	mkdirSync: jest.fn(),
	writeFileSync: jest.fn(),
}));

import { existsSync, writeFileSync } from 'fs';
import { UploadService } from './upload.service';

const fakeFile = (
	overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
	({
		fieldname: 'img',
		originalname: 'My Photo.png',
		mimetype: 'image/png',
		size: 1024,
		buffer: Buffer.from('fake-image-bytes'),
		...overrides,
	}) as Express.Multer.File;

const service = new UploadService();

beforeEach(() => {
	(existsSync as jest.Mock).mockClear().mockReturnValue(true);
	(writeFileSync as jest.Mock).mockClear();
});

describe('UploadService.uploadImage', () => {
	it('writes a sanitized, timestamped file name and returns it', () => {
		const response = service.uploadImage(fakeFile());

		expect(response).toMatchObject({
			status: 200,
			success: true,
		});

		const [path, buffer] = (writeFileSync as jest.Mock).mock.calls[0];
		expect(path).toMatch(/^.*uploads\/my-photo-\d+\.png$/);
		expect(buffer).toEqual(Buffer.from('fake-image-bytes'));
	});

	it('strips path characters from client-provided names', () => {
		service.uploadImage(fakeFile({ originalname: '../../etc/passwd.png' }));

		const [path] = (writeFileSync as jest.Mock).mock.calls[0];
		expect(path).toMatch(/uploads[\\/]file-\d+\.png$/);
		expect(path).not.toContain('..');
	});

	it('rejects a missing file', () => {
		const response = service.uploadImage(undefined);

		expect(response).toEqual({
			status: 400,
			success: false,
			message: 'The img is required',
		});
		expect(writeFileSync).not.toHaveBeenCalled();
	});

	it('rejects non-image files', () => {
		const response = service.uploadImage(
			fakeFile({ originalname: 'notes.txt', mimetype: 'text/plain' }),
		);

		expect(response).toEqual({
			status: 400,
			success: false,
			message: "You can't upload file beside an image",
		});
		expect(writeFileSync).not.toHaveBeenCalled();
	});

	it('rejects files over the 3 MB limit', () => {
		const response = service.uploadImage(fakeFile({ size: 3000001 }));

		expect(response).toEqual({
			status: 400,
			success: false,
			message: 'The image file is too large',
		});
		expect(writeFileSync).not.toHaveBeenCalled();
	});

	it('creates the uploads directory when it does not exist', () => {
		(existsSync as jest.Mock).mockReturnValue(false);

		service.uploadImage(fakeFile());

		expect(existsSync).toHaveBeenCalled();
	});
});
