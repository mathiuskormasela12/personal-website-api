// ========= Create Project Dto
// import all modules
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
	@MaxLength(100, { message: 'The title is too long' })
	@IsString({ message: 'The title should be a string' })
	@IsNotEmpty({ message: "The title can't be empty" })
	title: string;

	@IsString({ message: 'The description should be a string' })
	@IsNotEmpty({ message: "The description can't be empty" })
	description: string;

	@IsString({ message: 'The technologies should be a string' })
	@IsNotEmpty({ message: "The technologies can't be empty" })
	technologies: string;
}
