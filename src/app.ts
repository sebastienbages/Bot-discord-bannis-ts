import { GuildMember, Interaction, Message } from "discord.js";
import * as dotenv from "dotenv";
import { Config } from "./Config/Config";
import { Bot } from "./Bot";
import { EventsProvider } from "./EventsProvider";
import { ServicesProvider } from "./ServicesProvider";
import { WebhookProvider } from "./WebhookProvider";

dotenv.config();

ServicesProvider.initializeServices();
const logService = ServicesProvider.getLogService();
logService.info("Services initialises");

WebhookProvider.initializeWebHook();
logService.info("Webhooks initialises");

EventsProvider.initializeEvents();
logService.info("Evenements initialises");

const bot: Bot = new Bot(Config.token);

(async () => {
	await bot.start();
	logService.info("Le Bot est en ligne");

	const slashCommandService = ServicesProvider.getSlashCommandService();

	await slashCommandService.registerSlashCommand();
	logService.info("Commandes enregistrees");

	await slashCommandService.setCommandsPermission(Config.roleCommandsBotId, bot);
	await logService.info("Permissions des commandes mises a jour");
})();

bot.on("messageCreate", (message: Message) => EventsProvider.getMessageCreateEvent().run(message));
bot.on("guildMemberAdd", (member: GuildMember) => EventsProvider.getGuildMemberAddEvent().run(member));
bot.on("guildMemberRemove", (member: GuildMember) => EventsProvider.getGuildMemberRemoveEvent().run(member));
bot.on("interactionCreate", (interaction: Interaction) => EventsProvider.getInteractionCreateEvent().run(interaction));
