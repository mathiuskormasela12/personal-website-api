// ========== Database Module
// import all modules
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
	imports: [
		SequelizeModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				dialect: 'mysql',
				host: configService.get('DB_HOST'),
				port: Number(configService.get('DB_PORT')) || 3306,
				username: configService.get('DB_USER'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_NAME'),
				// Register models through their @Table decorator metadata and
				// create missing tables, matching the previous manual setup.
				autoLoadModels: true,
				synchronize: true,
			}),
		}),
	],
})
export class DatabaseModule {}
