// ========== Project Entity
// import all modules
import {
	Column,
	CreatedAt,
	DeletedAt,
	Model,
	Table,
	UpdatedAt,
	HasMany,
	DataType,
} from 'sequelize-typescript';
import { Technology } from 'src/technologies/technology.entity';

@Table
export class Project extends Model {
	@Column
	title: string;

	@Column(DataType.TEXT)
	description: string;

	@Column
	img: string;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@HasMany(() => Technology)
	technologies: Technology[];
}
