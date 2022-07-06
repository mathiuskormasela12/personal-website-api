// ========== Database Providers
// import all modules
import { Sequelize } from 'sequelize-typescript';
import 'dotenv/config';

// import all entities
import { User } from 'src/user/user.entity';
import { Technology } from 'src/technologies/technology.entity';
import { Project } from 'src/project/project.entity';

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

export const databaseProviders = [
	{
		provide: 'SEQUELIZE',
		useFactory: async () => {
			const sequelize = new Sequelize({
				dialect: 'mysql',
				host: DB_HOST,
				port: Number(DB_PORT),
				username: DB_USER,
				password: DB_PASSWORD,
				database: DB_NAME,
			});
			sequelize.addModels([User, Technology, Project]);
			await sequelize.sync();
			return sequelize;
		},
	},
];
