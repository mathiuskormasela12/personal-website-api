// ========== Hello World Controller
// import all modules
import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseService } from 'src/response/response.service';

@ApiTags('Hello World')
@Controller('hello-world')
export class HelloWorldController {
	constructor(private readonly responseService: ResponseService) {}

	/** Public endpoint (no guard). */
	@Get()
	public getHello(@Request() req: Request) {
		return this.responseService.responseGenerator(
			req,
			200,
			true,
			'Hello World!',
		);
	}
}
