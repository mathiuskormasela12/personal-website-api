// ========= Upload Service
// import all modules
import { HttpStatus, Injectable } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { IUploadFileResponse } from 'src/interfaces';

const MAX_FILE_SIZE = 3000000; // bytes
const UPLOADS_DIR = join(__dirname, '../../uploads');

@Injectable()
export class UploadService {
	public uploadImage(file?: Express.Multer.File): IUploadFileResponse {
		if (!file) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: 'The img is required',
			};
		}

		const invalid = this.isInvalidFile(file, /jpg|jpeg|png/, 'image');
		if (invalid) {
			return invalid;
		}

		const fileName = this.buildFileName(file.originalname);

		this.ensureUploadsDir();
		writeFileSync(join(UPLOADS_DIR, fileName), file.buffer);

		return {
			status: HttpStatus.OK,
			success: true,
			img: fileName,
		};
	}

	/** Shared validation: image/pdf extension or mime type, and the size limit. */
	private isInvalidFile(
		file: Express.Multer.File,
		extValid: RegExp,
		kind: string,
	): IUploadFileResponse | undefined {
		const checkMimeType = extValid.test(file.mimetype);
		const checkExtension = extValid.test(file.originalname);

		if (!checkMimeType && !checkExtension) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: `You can't upload file beside an ${kind}`,
			};
		}

		if (file.size > MAX_FILE_SIZE) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: `The ${kind} file is too large`,
			};
		}

		return undefined;
	}

	/**
	 * `<base>-<timestamp>.<ext>` — the base is sanitized to a safe file name
	 * (client-provided names could otherwise contain path characters).
	 */
	private buildFileName(originalname: string): string {
		const parts = originalname.split('.');
		const base =
			(parts.shift() ?? 'file').toLowerCase().replace(/[^a-z0-9_-]+/g, '-') ||
			'file';
		const ext = parts.pop()?.toLowerCase() ?? 'bin';
		return `${base}-${Date.now()}.${ext}`;
	}

	private ensureUploadsDir(): void {
		if (!existsSync(UPLOADS_DIR)) {
			mkdirSync(UPLOADS_DIR, { recursive: true });
		}
	}
}
