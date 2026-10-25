export type ProfileData = {
	skills: string[];
	skillsDescription: string;
	facebookUrl: string;
	twitterUrl: string;
	youtubeUrl: string;
};

export const PROFILE_DEFAULTS: ProfileData = {
	skills: [
		'HTML',
		'CSS',
		'Javascript',
		'Typescript',
		'Node Js',
		'Express Js',
		'Nest Js',
		'MySQL',
		'Mongodb',
	],
	skillsDescription:
		'The languages, frameworks and databases I use for my projects.',
	facebookUrl: 'https://www.facebook.com/mathiuskormasela/',
	twitterUrl: 'https://twitter.com/Mathius87248424',
	youtubeUrl: 'https://www.youtube.com/channel/UC5eUSF2W_vAkYA6wdilJjOw/videos',
};

export const PROFILE_FIELDS = Object.keys(
	PROFILE_DEFAULTS,
) as (keyof ProfileData)[];
