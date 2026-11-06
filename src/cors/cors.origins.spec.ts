// ========== CORS origin parser unit tests
import { DEFAULT_CORS_WHITELIST, parseCorsWhitelist } from './cors.origins';

describe('parseCorsWhitelist', () => {
	it('falls back to localhost when the variable is not set', () => {
		expect(parseCorsWhitelist(undefined)).toEqual(DEFAULT_CORS_WHITELIST);
		expect(DEFAULT_CORS_WHITELIST).toEqual(['http://localhost:3000']);
	});

	it('falls back to localhost when the variable is empty or blank', () => {
		expect(parseCorsWhitelist('')).toEqual(DEFAULT_CORS_WHITELIST);
		expect(parseCorsWhitelist('   ')).toEqual(DEFAULT_CORS_WHITELIST);
	});

	it('reads one origin', () => {
		expect(parseCorsWhitelist('http://192.168.8.5:3000')).toEqual([
			'http://192.168.8.5:3000',
		]);
	});

	it('reads many origins, trims spaces and skips empty items', () => {
		expect(parseCorsWhitelist(' http://a.local:1 , https://b.com ,, ')).toEqual(
			['http://a.local:1', 'https://b.com'],
		);
	});
});
