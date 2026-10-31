import {
	Column,
	CreatedAt,
	DataType,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';

@Table
export class Experience extends Model {
	@Column
	company: string;

	@Column
	role: string;

	@Column(DataType.STRING(7))
	startDate: string;

	@Column({ type: DataType.STRING(7), allowNull: true })
	endDate: string | null;

	@Column(DataType.JSON)
	description: string[];

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;
}
