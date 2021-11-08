// noinspection JSIgnoredPromiseFromCall
import { GuildMember, Message, MessageReaction, User } from "discord.js";
import * as dotenv from "dotenv";
import { Config } from "../Config/Config";
import { Bot } from "./Bot";
import { CommandHandler } from "./CommandHandler";
import { Events } from "./Events";
import { ServiceProvider } from "./ServiceProvider";
import { WebhookProvider } from "./WebhookProvider";
import { LogService } from "../Services/LogService";

dotenv.config();
const logService = new LogService();

try {
	(async () => {
		await logService.createLogFolder();
	})();
}
catch (error) {
	logService.error(error.stack);
}

ServiceProvider.initializeServices();
logService.log("Services initialisés");

WebhookProvider.initializeWebHook();
logService.log("Webhooks initialisés");

const commandHandler = new CommandHandler(Config.prefix);
logService.log("Gestion des commandes initialisée");

const events = new Events();
logService.log("Évènements initialisés");

const bot: Bot = new Bot(Config.token);
bot.start();

try {
	bot.client.on("messageCreate", (message: Message) => commandHandler.handleMessage(message, bot.client));
	bot.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => events.messageReactionAdd().run(messageReaction, user));
	bot.client.on("guildMemberAdd", (member: GuildMember) => events.guildMemberAdd().run(member));
	bot.client.on("guildMemberRemove", (member: GuildMember) => events.guildMemberRemove().run(member));
}
catch (error) {
	logService.error(error.stack);
}