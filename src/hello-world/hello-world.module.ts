// ========== Hello World Module
// import all modules
import { Module } from '@nestjs/common';
import { ResponseModule } from 'src/response/response.module';
import { HelloWorldController } from './hello-world.controller';

@Module({
	imports: [ResponseModule],
	controllers: [HelloWorldController],
})
export class HelloWorldModule {}
