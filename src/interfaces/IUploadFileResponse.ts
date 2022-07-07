// ========== IUploadFileResponse

export interface IUploadFileResponse {
	status: number;
	success: boolean;
	message?: string;
	img?: string;
	cv?: string;
}
