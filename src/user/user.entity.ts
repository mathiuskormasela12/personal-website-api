// ========= User Entity
// import all modules
import {
	Column,
	CreatedAt,
	DeletedAt,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';

@Table
export class User extends Model {
	@Column
	email: string;

	@Column
	password: string;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;
}
