// ========= Upload Service
// import all modules
import { HttpStatus, Injectable, Request } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { IRequestWithUpload, IUploadFileResponse } from 'src/interfaces';

@Injectable()
export class UploadService {
	public uploadImage(@Request() req: IRequestWithUpload): IUploadFileResponse {
		if (!req.files) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: 'The img is required',
			};
		}

		const img = req.files.img;
		const extValid = /jpg|jpeg|png/;
		const checkMimeType = extValid.test(img.mimetype);
		const checkExtension = extValid.test(img.name);

		if (!checkMimeType && !checkExtension) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: "You can't upload file beside an image",
			};
		}

		if (img.size > 3000000) {
			return {
				status: HttpStatus.BAD_REQUEST,
				success: false,
				message: 'The image file is too large',
			};
		}

		let fileName = img.name.split('.')[0].toLowerCase();
		const ext = img.name.split('.').pop().toLowerCase();
		fileName += '-';
		fileName += String(Date.now());
		fileName += '.';
		fileName += ext;

		const isUploadFolderExists = existsSync(join(__dirname, '../../uploads'));

		if (!isUploadFolderExists) {
			mkdirSync(join(__dirname, '../../uploads'));
		}

		img.mv(join(__dirname, '../../uploads/' + fileName));

		return {
			status: HttpStatus.OK,
			success: true,
			img: fileName,
		};
	}
}
