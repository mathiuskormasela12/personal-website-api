// ========== Reset Password Dto
// import all modules
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
	@MinLength(5, { message: 'The password is too short' })
	@Matches(/([A-Z])/, { message: 'The password is too weak' })
	@Matches(/([a-z])/, { message: 'The password is too weak' })
	@Matches(/([0-9])/, { message: 'The password is too weak' })
	@Matches(/([\W])/, { message: 'The password is too weak' })
	@IsString({ message: 'The password must be a string' })
	@IsNotEmpty({ message: "The password can't be empty" })
	password: string;

	@MinLength(5, { message: 'The repeat password is too short' })
	@Matches(/([A-Z])/, { message: 'The repeat password is too weak' })
	@Matches(/([a-z])/, { message: 'The repeat password is too weak' })
	@Matches(/([0-9])/, { message: 'The repeat password is too weak' })
	@Matches(/([\W])/, { message: 'The repeat password is too weak' })
	@IsString({ message: 'The repeat password must be a string' })
	@IsNotEmpty({ message: "The repeat password can't be empty" })
	repeatPassword: string;
}
