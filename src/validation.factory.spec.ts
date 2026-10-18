// ========== Validation exception factory unit tests
import { HttpException, ValidationError } from '@nestjs/common';
import { validationExceptionFactory } from './main';

/** ValidationError is only a type from @nestjs/common; tests use plain objects. */
const errorWith = (constraints: Record<string, string> | undefined) =>
	({ constraints }) as unknown as ValidationError;

describe('validationExceptionFactory', () => {
	it('reports the first constraint of the first error in the API response shape', () => {
		const exception = validationExceptionFactory([
			errorWith({ isEmail: 'email must be an email' }),
			errorWith({ isNotEmpty: 'other' }),
		]) as HttpException;

		expect(exception).toBeInstanceOf(HttpException);
		expect(exception.getStatus()).toBe(400);
		expect(exception.getResponse()).toEqual({
			status: 400,
			success: false,
			message: 'email must be an email',
		});
	});

	it('falls back to a generic message when there are no constraints', () => {
		const exception = validationExceptionFactory([
			errorWith(undefined),
		]) as HttpException;

		expect(exception.getResponse()).toMatchObject({
			status: 400,
			success: false,
			message: 'Validation failed',
		});
	});

	it('handles an empty error list', () => {
		const exception = validationExceptionFactory([]) as HttpException;
		expect(exception.getResponse()).toMatchObject({
			message: 'Validation failed',
		});
	});
});
