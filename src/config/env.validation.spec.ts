// ========== Environment validation schema unit tests
import { envValidationSchema } from './env.validation';

const requiredVars = {
	DB_HOST: 'localhost',
	DB_USER: 'api',
	DB_PASSWORD: 'secret',
	DB_NAME: 'personal_website',
	SECRET_KEY: 'secret',
	JWT_ACCESS_TOKEN_SECRET_KEY: 'access',
	JWT_REFRESH_TOKEN_SECRET_KEY: 'refresh',
	JWT_ACCESS_TOKEN_EXPIRES_IN: '1h',
	JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
};

const validate = (env: Record<string, unknown>) =>
	envValidationSchema.validate(env, { allowUnknown: true, abortEarly: false });

describe('envValidationSchema', () => {
	it('accepts the required variables', () => {
		const { error, value } = validate({ ...requiredVars });
		expect(error).toBeUndefined();
		expect(value.DB_PORT).toBe(3306);
	});

	it('accepts optional mailer and URL variables', () => {
		const { error } = validate({
			...requiredVars,
			PORT: 9000,
			APP_URL: 'https://example.com',
			EMAIL: 'no-reply@example.com',
			EMAIL_PORT: 465,
		});
		expect(error).toBeUndefined();
	});

	it('accepts a CORS whitelist with several origins', () => {
		const { error } = validate({
			...requiredVars,
			CORS_WHITELIST: 'http://192.168.8.5:3000,https://mathiuskormasela.com',
		});
		expect(error).toBeUndefined();
	});

	it('accepts an empty CORS whitelist, so the default is used', () => {
		const { error } = validate({ ...requiredVars, CORS_WHITELIST: '' });
		expect(error).toBeUndefined();
	});

	it('accepts a CORS whitelist that is not set', () => {
		const { error } = validate({ ...requiredVars });
		expect(error).toBeUndefined();
	});

	it.each([
		'http://192.168.8.5:3000/',
		'http://192.168.8.5:3000/app',
		'ftp://192.168.8.5',
		'not a url',
		'http://192.168.8.5:3000,not a url',
	])('rejects the bad CORS whitelist value "%s"', (origins) => {
		const { error } = validate({ ...requiredVars, CORS_WHITELIST: origins });
		expect(error).toBeDefined();
		expect(error.details.map((d) => d.path[0])).toContain('CORS_WHITELIST');
	});

	it('rejects missing required variables and reports all of them', () => {
		const { error } = validate({});
		expect(error).toBeDefined();
		const missing = error.details.map((d) => d.path[0]);
		for (const key of Object.keys(requiredVars)) {
			expect(missing).toContain(key);
		}
	});

	it('rejects a malformed port', () => {
		const { error } = validate({ ...requiredVars, PORT: 'not-a-port' });
		expect(error).toBeDefined();
	});

	it('ignores unknown variables', () => {
		const { error } = validate({ ...requiredVars, SOMETHING_ELSE: 'x' });
		expect(error).toBeUndefined();
	});
});
