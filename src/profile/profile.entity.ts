import {
	Column,
	CreatedAt,
	DataType,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import { ProfileData } from './profile.defaults';

@Table
export class Profile extends Model<ProfileData, ProfileData> {
	@Column(DataType.JSON)
	skills: string[];

	@Column(DataType.TEXT)
	skillsDescription: string;

	@Column
	facebookUrl: string;

	@Column
	twitterUrl: string;

	@Column
	youtubeUrl: string;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;
}
