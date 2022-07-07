// ========= Forgot Password Dto
// import all modules
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
	@IsEmail()
	@IsString({ message: 'The email must be a string' })
	@IsNotEmpty({ message: 'The email is required' })
	email: string;
}
