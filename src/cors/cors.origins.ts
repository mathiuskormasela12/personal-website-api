export const DEFAULT_CORS_WHITELIST = ['http://localhost:3000'];

export function parseCorsWhitelist(raw: string | undefined): string[] {
	const origins = (raw ?? '')
		.split(',')
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);
	return origins.length > 0 ? origins : [...DEFAULT_CORS_WHITELIST];
}

export function isCorsOrigin(value: string): boolean {
	try {
		const url = new URL(value);
		const isWebProtocol = url.protocol === 'http:' || url.protocol === 'https:';
		return isWebProtocol && url.origin === value;
	} catch {
		return false;
	}
}
