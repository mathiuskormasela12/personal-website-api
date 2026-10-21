// ========== Response Service unit tests
import { HttpException } from '@nestjs/common';
import { ResponseService } from './response.service';

const configService = { get: jest.fn(() => 'http://localhost:3000') } as any;
const req: any = { url: 'http://localhost:3000/projects?page=1&sort=name' };

describe('ResponseService', () => {
	const service = new ResponseService(configService);

	describe('response', () => {
		it('wraps the body in an HttpException carrying the status', () => {
			const error = service.response({
				status: 400,
				success: false,
				message: 'boom',
			});

			expect(error).toBeInstanceOf(HttpException);
			expect(error.getStatus()).toBe(400);
			expect(error.getResponse()).toEqual({
				status: 400,
				success: false,
				message: 'boom',
			});
		});
	});

	describe('responseGenerator', () => {
		it('returns a plain status/success/message body without results', () => {
			expect(service.responseGenerator(req, 200, true, 'All good')).toEqual({
				status: 200,
				success: true,
				message: 'All good',
			});
		});

		it('includes non-array results as-is', () => {
			const body = service.responseGenerator(req, 201, true, 'Created', {
				id: 1,
			});

			expect(body).toMatchObject({ status: 201, results: { id: 1 } });
		});

		it('adds paging links for array results', () => {
			const body = service.responseGenerator(
				req,
				200,
				true,
				'Listed',
				[{ id: 1 }],
				3,
				30,
			);

			expect(body.pageInfo).toMatchObject({
				totalPages: 3,
				totalData: 30,
				currentPage: 1,
				previousLink: null,
				nextLink: 'http://localhost:3000/projects?page=2&sort=name',
			});
		});

		it('builds a previous link beyond the first page', () => {
			const body = service.responseGenerator(
				{ url: 'http://localhost:3000/projects?page=2' } as any,
				200,
				true,
				'Listed',
				[{ id: 1 }],
				3,
				30,
			);

			expect(body.pageInfo.previousLink).toBe(
				'http://localhost:3000/projects?page=1',
			);
			expect(body.pageInfo.nextLink).toBe(
				'http://localhost:3000/projects?page=3',
			);
		});
	});
});
