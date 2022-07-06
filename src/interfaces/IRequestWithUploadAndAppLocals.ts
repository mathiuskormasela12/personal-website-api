// ========= IRequestWithUploadAndAppLocals
// import all modules
import { IRequestWithUpload } from '.';

export interface IRequestWithUploadAndAppLocals extends IRequestWithUpload {
	app: {
		locals: {
			decode: {
				id: number;
				email: string;
				iat: number;
				exp: number;
			};
		};
	};
}
