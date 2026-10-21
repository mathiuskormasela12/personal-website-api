// ========== Hero Service
// import all modules
import { HttpStatus, Injectable, Request } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ResponseService } from 'src/response/response.service';
import { UpdateHeroDto } from './dto';
import { HERO_DEFAULTS, HERO_FIELDS, HeroTexts } from './hero.defaults';
import { Hero } from './hero.entity';

@Injectable()
export class HeroService {
	constructor(
		private readonly responseService: ResponseService,
		@InjectModel(Hero)
		private readonly heroRepository: typeof Hero,
	) {}

	public async getHero(@Request() req: Request) {
		try {
			const hero = await this.findHero();

			return this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'Get the hero texts',
				hero ? this.toTexts(hero) : { ...HERO_DEFAULTS },
			);
		} catch (err) {
			throw this.serverError(err);
		}
	}

	public async updateHero(@Request() req: Request, dto: UpdateHeroDto) {
		try {
			const values = this.toTexts(dto);
			const hero = await this.findHero();
			const saved = hero
				? await hero.update(values)
				: await this.heroRepository.create(values);

			return this.responseService.responseGenerator(
				req,
				HttpStatus.OK,
				true,
				'The hero texts have been updated',
				this.toTexts(saved),
			);
		} catch (err) {
			throw this.serverError(err);
		}
	}

	/** The texts live in a single row: always the first one. */
	private findHero() {
		return this.heroRepository.findOne({ order: [['id', 'ASC']] });
	}

	private toTexts(source: HeroTexts): HeroTexts {
		return HERO_FIELDS.reduce(
			(texts, field) => ({ ...texts, [field]: source[field] }),
			{} as HeroTexts,
		);
	}

	private serverError(err: unknown) {
		return this.responseService.response({
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			success: false,
			message: err instanceof Error ? err.message : 'Something went wrong',
		});
	}
}
