import * as dotenv from "dotenv";
import { AdminCommand } from "../Commands/admin/Admin";
import { TicketCommand } from "../Commands/admin/Ticket";
import { ICommand } from "../Commands/ICommand";
import { AddRoleCommand } from "../Commands/moderation/AddRole";
import { ClearCommand } from "../Commands/moderation/Clear";
import { RemoveRoleCommand } from "../Commands/moderation/RemoveRole";
import { SayCommand } from "../Commands/moderation/Say";
import { SayPrivCommand } from "../Commands/moderation/SayPriv";
import { SaySimpleCommand } from "../Commands/moderation/SaySimple";
import { SurveyCommand } from "../Commands/admin/Survey";
import { HelpCommand } from "../Commands/utility/Help";
import { RestartCommand } from "../Commands/utility/Restart";
import { TopServerCommand } from "../Commands/utility/TopServer";
import { VoteCommand } from "../Commands/admin/Vote";
import { RulesCommand } from "../Commands/moderation/Rules";
import { ColorResolvable } from "discord.js";

dotenv.config();

export class Config {
	// ENV
	public static readonly nodeEnv: string = process.env.NODE_ENV;

	// GUILD
	public static readonly guildId: string = process.env.GUILD_ID;

	// TOKENS
	public static readonly token: string = process.env.TOKEN;
	public static readonly tokenTopServer: string = process.env.TOKEN_TOP_SERVEUR;

	// CONFIG
	public static readonly color: ColorResolvable = [255, 255, 0];
	public static readonly devId: string = process.env.DEV_ID;
	public static readonly prefix: string = process.env.PREFIX;

	// CHANNELS
	public static readonly ticketChannel: string = process.env.CHA_TICKET;
	public static readonly rulesChannelId: string = process.env.CHA_RULES;
	public static readonly welcomeChannel: string = process.env.CHA_WELCOME;
	public static readonly surveyChannelId: string = process.env.CHA_SURVEY;
	public static readonly voteChannelId: string = process.env.CHA_VOTE;

	// CATEGORIES
	public static readonly categoryTicketChannel: string = process.env.CATEGORY_TICKET;
	public static readonly ticketMessage: string = process.env.MSG_TICKET;

	// WEBHOOKS
	public static readonly webhookServerKeeper: string = process.env.WH_SERVER_KEEPER;

	// ROLES
	public static readonly roleStart: string = process.env.ROLE_START;

	// CHOICE SERVER
	public static readonly serverChoiceMsg: string = process.env.SERVER_MSG;
	public static readonly serverRoleOne: string = process.env.SERVER_ROLE_1;
	public static readonly serverRoleTwo: string = process.env.SERVER_ROLE_2;

	// COMMANDS
	public static readonly commands = [
		SayCommand,
		SaySimpleCommand,
		SurveyCommand,
		SayPrivCommand,
		AddRoleCommand,
		RemoveRoleCommand,
		ClearCommand,
		HelpCommand,
		RestartCommand,
		TopServerCommand,
		VoteCommand,
		AdminCommand,
		TicketCommand,
		RulesCommand,
	];

	/**
	 * Retourne la liste des commandes du bot
	 */
	public static getCommandsInstances(): ICommand[] {
		return Config.commands.map(commandClass => new commandClass());
	}
}