// ========== Hello World Controller unit tests
import { HelloWorldController } from './hello-world.controller';
import { ResponseService } from 'src/response/response.service';

const req: any = { url: 'http://localhost:9000/hello-world' };

describe('HelloWorldController', () => {
	const controller = new HelloWorldController(
		new ResponseService({ get: jest.fn() } as any),
	);

	it('returns the standard success body with the hello-world message', () => {
		expect(controller.getHello(req)).toEqual({
			status: 200,
			success: true,
			message: 'Hello World!',
		});
	});
});
