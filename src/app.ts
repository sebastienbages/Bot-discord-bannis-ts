// noinspection JSIgnoredPromiseFromCall

import { GuildMember, Message, MessageReaction, User } from "discord.js";
import * as dotenv from "dotenv";
import { Config } from "../Config/Config";
import { Bot } from "./Bot";
import { CommandHandler } from "./CommandHandler";
import { Events } from "./Events";
import { ServiceProvider } from "./ServiceProvider";
import { WebhookProvider } from "./WebhookProvider";

dotenv.config();

const bot: Bot = new Bot(Config.token);
bot.start();

ServiceProvider.initializeServices();
WebhookProvider.initializeWebHook();

const commandHandler = new CommandHandler(process.env.PREFIX);
const events = new Events();

const sendError = async (err) => {
	const dev = await bot.client.users.fetch(Config.devId);
	await dev.send("Une erreur s'est produite sur le bot");
	await dev.send(err);
	return err;
};

try {
	bot.client.on("message", (message: Message) => commandHandler.handleMessage(message, bot.client));
	bot.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => events.messageReactionAdd().run(messageReaction, user));
	bot.client.on("guildMemberAdd", (member: GuildMember) => events.guildMemberAdd().run(member));
	bot.client.on("guildMemberRemove", (member: GuildMember) => events.guildMemberRemove().run(member));
}
catch (error) {
	console.error(sendError(error));
}