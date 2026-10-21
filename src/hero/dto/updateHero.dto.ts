// ========= Update Hero Dto
// import all modules
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
	typeof value === 'string' ? value.trim() : value;

export class UpdateHeroDto {
	/** Dark text before the highlight, e.g. "Hi, I'm" */
	@Transform(trim)
	@MaxLength(60, { message: 'The greeting is too long (max 60)' })
	@IsNotEmpty({ message: "The greeting can't be empty" })
	@IsString({ message: 'The greeting should be a string' })
	titlePrefix: string;

	/** Blue highlighted text, e.g. "a Fullstack Developer" */
	@Transform(trim)
	@MaxLength(60, { message: 'The highlighted text is too long (max 60)' })
	@IsNotEmpty({ message: "The highlighted text can't be empty" })
	@IsString({ message: 'The highlighted text should be a string' })
	titleHighlight: string;

	/** Dark text right after the highlight, e.g. "." (may be empty) */
	@Transform(trim)
	@MaxLength(10, { message: 'The ending is too long (max 10)' })
	@IsString({ message: 'The ending should be a string' })
	titleSuffix: string;

	@Transform(trim)
	@MaxLength(300, { message: 'The subtitle is too long (max 300)' })
	@IsNotEmpty({ message: "The subtitle can't be empty" })
	@IsString({ message: 'The subtitle should be a string' })
	subtitle: string;

	@Transform(trim)
	@MaxLength(30, { message: 'The button text is too long (max 30)' })
	@IsNotEmpty({ message: "The button text can't be empty" })
	@IsString({ message: 'The button text should be a string' })
	buttonText: string;

	@Transform(trim)
	@MaxLength(255, { message: 'The button link is too long (max 255)' })
	@IsUrl(
		{ protocols: ['http', 'https'], require_protocol: true },
		{ message: 'The button link should be a http(s) URL' },
	)
	buttonUrl: string;
}
