// ========== Get All Projects Dto
// import all modules
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetAllProjectsDto {
	@Type(() => Number)
	@IsNumber({}, { each: true })
	page?: number = 1;

	@Type(() => Number)
	@IsNumber({}, { each: true })
	limit?: number = 5;
}
