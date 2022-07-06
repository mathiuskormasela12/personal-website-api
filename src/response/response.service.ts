// ========== Response Service
// import all modules
import { HttpException, Injectable, Request } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parse } from 'url';
import { IResponse } from 'src/interfaces';

@Injectable()
export class ResponseService {
	constructor(private readonly configService: ConfigService) {}

	public response(response: IResponse) {
		return new HttpException(response, response.status);
	}

	public responseGenerator(
		@Request() req: Request,
		status: number,
		success: boolean,
		message: string,
		results?: unknown,
		totalPages?: number,
		totalData?: number,
	) {
		if (results && typeof results === 'object' && !Array.isArray(results)) {
			return {
				status,
				success,
				message,
				results,
			};
		} else if (
			results &&
			typeof results === 'object' &&
			Array.isArray(results) &&
			totalData &&
			totalPages
		) {
			const {
				query: { page = 1, ...queries },
				pathname,
			} = parse(req.url, true);

			const modifiedQueries = { page, ...queries };

			return {
				status,
				success,
				message,
				results,
				pageInfo: {
					totalPages,
					totalData,
					currentPage: Number(page),
					previousLink:
						Number(page) > 1
							? `${this.configService.get('APP_URL')}${pathname}?${Object.keys(
									modifiedQueries,
							  )
									.map(
										(item, index) =>
											`${
												item === 'page'
													? `${item}=${
															Number(Object.values(modifiedQueries)[index]) - 1
													  }`
													: `${item}=${Object.values(modifiedQueries)[index]}`
											}`,
									)
									.join('&')}`
							: null,
					nextLink:
						Number(page) < totalPages
							? `${this.configService.get('APP_URL')}${pathname}?${Object.keys(
									modifiedQueries,
							  )
									.map(
										(item, index) =>
											`${
												item === 'page'
													? `${item}=${
															Number(Object.values(modifiedQueries)[index]) + 1
													  }`
													: `${item}=${Object.values(modifiedQueries)[index]}`
											}`,
									)
									.join('&')}`
							: null,
				},
			};
		} else {
			return {
				status,
				success,
				message,
			};
		}
	}
}
