// ========== IResponse

export interface IResponse {
	status: number;
	success: boolean;
	message: string;
	results?: unknown;
}
