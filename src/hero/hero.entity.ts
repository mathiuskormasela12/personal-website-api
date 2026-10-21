// ========== Hero Entity
// A single row holding the editable home-page hero texts.
// import all modules
import {
	Column,
	CreatedAt,
	DataType,
	Model,
	Table,
	UpdatedAt,
} from 'sequelize-typescript';
import { HeroTexts } from './hero.defaults';

@Table
export class Hero extends Model<HeroTexts, HeroTexts> {
	@Column
	titlePrefix: string;

	@Column
	titleHighlight: string;

	@Column
	titleSuffix: string;

	@Column(DataType.TEXT)
	subtitle: string;

	@Column
	buttonText: string;

	@Column
	buttonUrl: string;

	@CreatedAt
	createdAt: Date;

	@UpdatedAt
	updatedAt: Date;
}
