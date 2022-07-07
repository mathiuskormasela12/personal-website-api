// ========== IRequestWithUpload

export interface IRequestWithUpload extends Request {
	files: {
		img?: {
			name: string;
			mimetype: string;
			size: number;
			mv: (path: string) => void;
		};
		cv?: {
			name: string;
			mimetype: string;
			size: number;
			mv: (path: string) => void;
		};
	};
}
