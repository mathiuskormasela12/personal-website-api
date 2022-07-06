// ========== Nodemailer Module
// import all modules
import { Global, Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';

@Global()
@Module({
	exports: [NodemailerService],
	providers: [NodemailerService],
})
export class NodemailerModule {}
