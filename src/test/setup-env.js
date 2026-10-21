// Jest setup: runs before each test file's module registry, so specs that boot
// AppModule get the env vars required by the ConfigModule validation schema.
// The database itself stays stubbed in those specs.
const requiredEnv = [
	'DB_HOST',
	'DB_USER',
	'DB_PASSWORD',
	'DB_NAME',
	'SECRET_KEY',
	'JWT_ACCESS_TOKEN_SECRET_KEY',
	'JWT_REFRESH_TOKEN_SECRET_KEY',
	'JWT_ACCESS_TOKEN_EXPIRES_IN',
	'JWT_REFRESH_TOKEN_EXPIRES_IN',
]

for (const key of requiredEnv) {
	process.env[key] = process.env[key] || `test-${key}`
}
