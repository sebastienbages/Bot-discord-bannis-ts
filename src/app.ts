import { GuildMember, Interaction, Message } from "discord.js";
import * as dotenv from "dotenv";
import { Config } from "./Config/Config";
import { Bot } from "./Bot";
import { EventsProvider } from "./EventsProvider";
import { ServicesProvider } from "./ServicesProvider";
import { WebhookProvider } from "./WebhookProvider";
import { LogService } from "./Services/LogService";

dotenv.config();
const logService = new LogService();

ServicesProvider.initializeServices();
logService.log("Services initialises");

WebhookProvider.initializeWebHook();
logService.log("Webhooks initialises");

const events = new EventsProvider();
logService.log("Evenements initialises");

const bot: Bot = new Bot(Config.token, events);
bot.start();

(async () => {
	try {
		await ServicesProvider.getSlashCommandService().registerSlashCommand();
		logService.log("Commandes enregistrees");
	}
	catch (error) {
		logService.error(error);
	}
})();

try {
	bot.client.on("messageCreate", (message: Message) => events.messageCreateEvent().run(message));
	bot.client.on("guildMemberAdd", (member: GuildMember) => events.guildMemberAdd().run(member));
	bot.client.on("guildMemberRemove", (member: GuildMember) => events.guildMemberRemove().run(member));
	bot.client.on("interactionCreate", (interaction: Interaction) => events.interactionCreate().run(interaction));
}
catch (error) {
	logService.error(error);
}
