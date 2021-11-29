import * as dotenv from "dotenv";
import { ColorResolvable } from "discord.js";

dotenv.config();

export class Config {
	// ENV
	public static readonly nodeEnvValues = {
		production: "production",
		development: "dev",
	};
	public static readonly nodeEnv: string = process.env.NODE_ENV;

	// APPLICATION
	public static readonly applicationId: string = process.env.APPLICATION_ID;

	// GUILD
	public static readonly guildId: string = process.env.GUILD_ID;

	// TOKENS
	public static readonly token: string = process.env.TOKEN;
	public static readonly tokenTopServer: string = process.env.TOKEN_TOP_SERVEUR;

	// CONFIG
	public static readonly color: ColorResolvable = [255, 255, 0];
	public static readonly devId: string = process.env.DEV_ID;
	public static readonly outDir: string = "src/";

	// CHANNELS
	public static readonly ticketChannel: string = process.env.CHA_TICKET;
	public static readonly rulesChannelId: string = process.env.CHA_RULES;
	public static readonly welcomeChannel: string = process.env.CHA_WELCOME;
	public static readonly surveyChannelId: string = process.env.CHA_SURVEY;
	public static readonly voteChannelId: string = process.env.CHA_VOTE;
	public static readonly borderChannel: string = process.env.CHA_FRONTIERE;

	// CATEGORIES
	public static readonly categoryTicketChannel: string = process.env.CATEGORY_TICKET;
	public static readonly ticketMessage: string = process.env.MSG_TICKET;

	// WEBHOOKS
	public static readonly webhookServerKeeper1: string = process.env.WH_SERVER_KEEPER1;
	public static readonly webhookServerKeeper2: string = process.env.WH_SERVER_KEEPER2;

	// ROLES
	public static readonly roleStart: string = process.env.ROLE_START;
	public static readonly roleFrontiere: string = process.env.ROLE_FRONTIERE;

	// CHOICE SERVER
	public static readonly serverChoiceMsg: string = process.env.MSG_SERVER;
	public static readonly serverRoleOne: string = process.env.SERVER_ROLE_1;
	public static readonly serverRoleTwo: string = process.env.SERVER_ROLE_2;
}
