// ========== Hero defaults
// The texts the home page showed before they became editable. Returned until
// the owner saves their own, so the site looks the same out of the box.

export type HeroTexts = {
	titlePrefix: string;
	titleHighlight: string;
	titleSuffix: string;
	subtitle: string;
	buttonText: string;
	buttonUrl: string;
};

export const HERO_DEFAULTS: HeroTexts = {
	titlePrefix: "Hi, I'm",
	titleHighlight: 'a Fullstack Developer',
	titleSuffix: '.',
	subtitle:
		"I'm Mathius a fullstack developer with 1+ years working experiences.",
	buttonText: 'My Youtube',
	buttonUrl: 'https://www.youtube.com/channel/UC5eUSF2W_vAkYA6wdilJjOw',
};

export const HERO_FIELDS = Object.keys(HERO_DEFAULTS) as (keyof HeroTexts)[];
