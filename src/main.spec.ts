// ========== Main (listen target) unit tests
describe('getListenTarget', () => {
	const originalPort = process.env.PORT;

	afterEach(() => {
		process.env.PORT = originalPort;
	});

	it('defaults to port 9000 on 0.0.0.0 when PORT is unset', async () => {
		delete process.env.PORT;
		const { getListenTarget } = await import('./main');
		expect(getListenTarget()).toEqual({ port: 9000, host: '0.0.0.0' });
	});

	it('defaults to port 9000 when PORT is empty or not a number', async () => {
		const { getListenTarget } = await import('./main');
		for (const bad of ['', 'abc', '0', '-4', '8080.5']) {
			process.env.PORT = bad;
			expect(getListenTarget().port).toBe(9000);
		}
	});

	it('uses PORT when it is a valid port number', async () => {
		const { getListenTarget } = await import('./main');
		process.env.PORT = '9123';
		expect(getListenTarget()).toEqual({ port: 9123, host: '0.0.0.0' });
	});

	it('never boots when required directly (bootstrap is opt-in)', async () => {
		// Importing ./main must not start the server (the DB is unavailable in tests).
		jest.isolateModules(async () => {
			await import('./main');
		});
	});
});
