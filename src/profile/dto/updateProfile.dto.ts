import { Transform } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	ArrayUnique,
	IsArray,
	IsEmail,
	IsNotEmpty,
	IsPhoneNumber,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
	ValidateIf,
} from 'class-validator';

const trim = (value: unknown) =>
	typeof value === 'string' ? value.trim() : value;

const trimText = ({ value }: { value: unknown }) => trim(value);

const trimList = ({ value }: { value: unknown }) =>
	Array.isArray(value) ? value.map(trim) : value;

const lowerCase = (value: unknown) =>
	typeof value === 'string' ? value.toLowerCase() : value;

const SocialLink = (name: string): PropertyDecorator => {
	const decorators = [
		Transform(trimText),
		ValidateIf((_, value) => value !== ''),
		IsUrl(
			{ protocols: ['http', 'https'], require_protocol: true },
			{ message: `The ${name} link should be a http(s) URL` },
		),
		MaxLength(255, { message: `The ${name} link is too long (max 255)` }),
		IsString({ message: `The ${name} link should be a text` }),
	];
	return (target, key) =>
		decorators.forEach((decorator) => decorator(target, key));
};

export class UpdateProfileDto {
	@Transform(trimList)
	@ArrayUnique(lowerCase, { message: 'Each skill can only be added once' })
	@MaxLength(30, { each: true, message: 'A skill is too long (max 30)' })
	@IsNotEmpty({ each: true, message: "A skill can't be empty" })
	@IsString({ each: true, message: 'A skill should be a text' })
	@ArrayMaxSize(24, { message: 'You can add up to 24 skills' })
	@ArrayMinSize(1, { message: 'Add at least one skill' })
	@IsArray({ message: 'The skills should be a list' })
	skills: string[];

	@Transform(trimText)
	@MaxLength(300, { message: 'The description is too long (max 300)' })
	@IsNotEmpty({ message: "The description can't be empty" })
	@IsString({ message: 'The description should be a text' })
	skillsDescription: string;

	@SocialLink('Facebook')
	facebookUrl: string;

	@SocialLink('Twitter')
	twitterUrl: string;

	@SocialLink('Youtube')
	youtubeUrl: string;

	@Transform(trimText)
	@MaxLength(30, { message: 'Your name is too long (max 30)' })
	@IsNotEmpty({ message: "Your name can't be empty" })
	@IsString({ message: 'Your name should be a text' })
	name: string;

	@Transform(trimText)
	@ValidateIf((_, value) => value !== '')
	@MaxLength(255, { message: 'The email is too long (max 255)' })
	@IsEmail({}, { message: "The email doesn't look right" })
	@IsString({ message: 'The email should be a text' })
	email: string;

	@Transform(trimText)
	@ValidateIf((_, value) => value !== '')
	@IsPhoneNumber(undefined, {
		message: "The phone number doesn't look right",
	})
	@Matches(/^\+[1-9]\d{5,14}$/, {
		message: 'The phone number should start with + and the country code',
	})
	@IsString({ message: 'The phone number should be a text' })
	phone: string;
}
