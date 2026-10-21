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
		expect(value.DB_PORT).toBe(3306); // default applied
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
