// ========== Environment validation schema
// Fails fast at boot when a required variable is missing or malformed.
import Joi from 'joi';

export const envValidationSchema = Joi.object({
	// API
	PORT: Joi.number().port().optional(),
	APP_URL: Joi.string().uri().optional(),
	API_URL: Joi.string().uri().optional(),
	WEB_HOSTNAME: Joi.string().uri().optional(),

	// Database (MySQL) — required, the app cannot run without it
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().port().default(3306),
	DB_USER: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_NAME: Joi.string().required(),

	// Auth secrets — required for register/login/refresh flows
	SECRET_KEY: Joi.string().required(),
	JWT_ACCESS_TOKEN_SECRET_KEY: Joi.string().required(),
	JWT_REFRESH_TOKEN_SECRET_KEY: Joi.string().required(),
	JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
	JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),

	// Mailer — optional: the API boots without it, only password-reset emails fail
	EMAIL: Joi.string().optional(),
	EMAIL_PASSWORD: Joi.string().optional(),
	EMAIL_HOST: Joi.string().optional(),
	EMAIL_PORT: Joi.number().port().optional(),
	EMAIL_SERVICE: Joi.string().optional(),
})
	// process.env always contains extra keys; the runtime path validates via
	// Standard Schema, where allowUnknown is not an option — bake it in here.
	.unknown(true);
