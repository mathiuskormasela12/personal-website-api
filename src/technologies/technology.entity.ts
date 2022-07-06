// ========== Technology Entity
// import all modules
import {
	BelongsTo,
	Column,
	CreatedAt,
	DeletedAt,
	ForeignKey,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import { Project } from 'src/project/project.entity';

@Table
export class Technology extends Model {
	@Column
	name: string;

	@ForeignKey(() => Project)
	@Column
	projectId: number;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;

	@DeletedAt
	deletedAt: Date;

	@BelongsTo(() => Project)
	projects: Project[];
}
