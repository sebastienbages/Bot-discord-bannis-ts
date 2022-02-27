export declare type TopServerInfos = {
	code: number;
	success: boolean;
	server: Server;
}

export declare type TopServerPlayerRanking = {
	code: number;
	success: boolean;
	players: Player[];
}

export declare type TopServerStats = {
	code: number;
	success: boolean;
	stats: {
		monthly: MonthlyStats[];
		weekly: WeeklyStats[];
	}
}

export declare type TopServerError = {
	code: number;
	success: boolean;
	message: string;
}

declare type Server = {
	top_id: number;
	name: string;
	slug: string;
	website: string;
	short_description: string;
	ip: string;
	port: number;
	slots: number;
	access: string;
	teamspeak_ip: string;
	teamspeak_port: number;
	mumble_ip: string;
	mumble_port: number;
	discord: string;
	total_clics: number;
	total_votes: number;
	total_likes: number;
	facebook: string;
	twitter: string;
	google: string;
	youtube: string;
	created_at: string;
	updated_at: string;
	players: string;
	online: number;
	plugins: string;
	twitch_login: string;
	twitch_live: number;
	display_lives: number;
	discord_webhook: string;
	show_ip: number;
	last_check: string;
	map: string;
	version: string;
	nb_fails: number;
	query_port: number;
	trailer: string;
	down_at: string;
	record_players: number;
}

export declare type Player = {
	votes: number;
	playername: string;
}

declare type MonthlyStats = {
	year: number;
	january_votes: number;
	february_votes: number;
	march_votes: number;
	april_votes: number;
	may_votes: number;
	june_votes: number;
	july_votes: number;
	august_votes: number;
	september_votes: number;
	october_votes: number;
	november_votes: number;
	december_votes: number;
	january_clics: number;
	february_clics: number;
	march_clics: number;
	april_clics: number;
	may_clics: number;
	june_clics: number;
	july_clics: number;
	august_clics: number;
	september_clics: number;
	october_clics: number;
	november_clics: number;
	december_clics: number;
}

declare type WeeklyStats = {
	year: number;
	number: number;
	monday_votes: number;
	tuesday_votes: number;
	wednesday_votes: number;
	thursday_votes: number;
	friday_votes: number;
	saturday_votes: number;
	sunday_votes: number;
	monday_clics: number;
	tuesday_clics: number;
	wednesday_clics: number;
	thursday_clics: number;
	friday_clics: number;
	saturday_clics: number;
	sunday_clics: number;
}
