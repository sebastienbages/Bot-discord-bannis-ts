import * as dotenv from "dotenv";
import { ColorResolvable, Snowflake } from "discord.js";

dotenv.config();

export class Config {
	// NODE ENV
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
	public static readonly devId: Snowflake = process.env.DEV_ID;
	public static readonly outDir: string = "src/";
	public static readonly imageDir: string = "./Assets/images";
	public static readonly fontsDir: string = "./Assets/fonts";

	// CHANNELS
	public static readonly ticketChannelId: string = process.env.CHA_TICKET;
	public static readonly rulesChannelId: Snowflake = process.env.CHA_RULES;
	public static readonly welcomeChannel: Snowflake = process.env.CHA_WELCOME;
	public static readonly surveyChannelId: Snowflake = process.env.CHA_SURVEY;
	public static readonly voteChannelId: Snowflake = process.env.CHA_VOTE;
	public static readonly borderChannelId: string = process.env.CHA_FRONTIERE;
	public static readonly departureChannelId: string = process.env.CHA_DEPARTURE;

	// CATEGORIES
	public static readonly categoryTicketChannelId: Snowflake = process.env.CATEGORY_TICKET;
	public static readonly ticketMessageId: Snowflake = process.env.MSG_TICKET;

	// WEBHOOKS
	public static readonly webhookServerKeeper1: string = process.env.WH_SERVER_KEEPER1;
	public static readonly webhookServerKeeper2: string = process.env.WH_SERVER_KEEPER2;

	// ROLES
	public static readonly roleStartId: Snowflake = process.env.ROLE_START;
	public static readonly roleFrontiereId: Snowflake = process.env.ROLE_FRONTIERE;
	public static readonly roleCommandsBotId: Snowflake = process.env.ROLE_COMMANDS;
}
