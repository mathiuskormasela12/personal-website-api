// ========== Create Access Token Dto
// import all modules

import { IsJWT, IsNotEmpty } from 'class-validator';

export class CreateAccessTokenDto {
	@IsJWT({ message: 'Invalid refresh token' })
	@IsNotEmpty({ message: 'The refresh token is required' })
	refreshToken: string;
}
