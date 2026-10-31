import { Transform } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	ValidateIf,
} from 'class-validator';

export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const trimText = ({ value }: { value: unknown }) =>
	typeof value === 'string' ? value.trim() : value;

const trimList = ({ value }: { value: unknown }) =>
	Array.isArray(value)
		? value.map((item) => (typeof item === 'string' ? item.trim() : item))
		: value;

const emptyToNull = ({ value }: { value: unknown }) =>
	value === '' || value === undefined ? null : value;

export class CreateOrUpdateExperienceDto {
	@Transform(trimText)
	@MaxLength(60, { message: 'The company name is too long (max 60)' })
	@IsNotEmpty({ message: "The company name can't be empty" })
	@IsString({ message: 'The company name should be a text' })
	company: string;

	@Transform(trimText)
	@MaxLength(60, { message: 'The role is too long (max 60)' })
	@IsNotEmpty({ message: "The role can't be empty" })
	@IsString({ message: 'The role should be a text' })
	role: string;

	@Matches(MONTH_PATTERN, {
		message: 'The start date should look like 2025-03',
	})
	@IsString({ message: 'The start date should be a text' })
	startDate: string;

	@Transform(emptyToNull)
	@ValidateIf((_, value) => value !== null)
	@Matches(MONTH_PATTERN, {
		message: 'The end date should look like 2025-03',
	})
	@IsString({ message: 'The end date should be a text' })
	endDate: string | null;

	@Transform(trimList)
	@MaxLength(200, { each: true, message: 'A point is too long (max 200)' })
	@IsNotEmpty({ each: true, message: "A point can't be empty" })
	@IsString({ each: true, message: 'A point should be a text' })
	@ArrayMaxSize(10, { message: 'You can add up to 10 points' })
	@ArrayMinSize(1, { message: 'Add at least one point' })
	@IsArray({ message: 'The description should be a list of points' })
	description: string[];
}
