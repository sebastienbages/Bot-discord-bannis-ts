import { Client, Collection, Message } from "discord.js";
import { ICommand } from "../Commands/ICommand";
import { CommandContext } from "../Commands/CommandContext";
import { Config } from "../Config/Config";
import { ServiceProvider } from "./ServiceProvider";
import { LogService } from "../Services/LogService";
import { DiscordHelper } from "../Helper/DiscordHelper";

export class CommandHandler {
	private _commands: ICommand[];
	private readonly _prefix: string;
	private _cooldowns: Collection<string, Collection<string, number>>;
	private _logService: LogService;

	constructor(prefix: string) {
		this._commands = Config.getCommandsInstances();
		this._prefix = prefix;
		this._cooldowns = new Collection();
		this._logService = new LogService();
	}

	async handleMessage(message: Message, client: Client): Promise<void> {
		if (message.author.bot) return undefined;

		if (message.channel.type === "DM" && !message.content.startsWith(this._prefix)) {
			const adminService = await ServiceProvider.getAdminService();
			return await adminService.transfertPrivateMessage(message);
		}

		if (!this.isCommand(message)) return undefined;

		if (message.channel.type != "DM") await message.delete();

		const commandContext = new CommandContext(message, this._prefix);
		const matchedCommands = this._commands.find(command => command.aliases.includes(commandContext.command) || command.name.includes(commandContext.command));

		if (!matchedCommands) {
			const response = await DiscordHelper.replyToMessageAuthor(message, "Je ne reconnais pas cette commande");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		this._logService.log(`${message.author.username} a utilisé une commande : ${commandContext.message}`);

		const guild = client.guilds.cache.find(g => g.id === Config.guildId);
		const authorPerms = guild.members.cache.find(user => user.id === message.author.id);

		if (!authorPerms || !authorPerms.permissions.has(matchedCommands.permission)) {
			if (message.channel.type != "DM") {
				const response = await DiscordHelper.replyToMessageAuthor(message, "Vous n'avez pas la permission d'utiliser cette commande");
				DiscordHelper.deleteMessage(response, 5000);
				return this._logService.log(`Commande ${commandContext.command} non autorisé pour ${message.author.username}`);
			}
			else {
				await DiscordHelper.replyToMessageAuthor(message, "Vous n'avez pas la permission d'utiliser cette commande");
				return;
			}
		}

		if (matchedCommands.guildOnly && message.channel.type === "DM") {
			await DiscordHelper.replyToMessageAuthor(message, "Je ne peux pas éxécuter cette commande dans un salon privé");
			return;
		}

		if (matchedCommands.argumentIsNecessary && !commandContext.args.length) {
			let reply = `Il vous manque l'argument, ${message.author} !`;

			if (matchedCommands.usage) {
				reply += `\nCette commande s'utilise comme ceci : \`${commandContext.commandPrefix}${matchedCommands.name} ${matchedCommands.usage}\``;
			}

			const response = await message.channel.send(reply);
			return DiscordHelper.deleteMessage(response, 10000);
		}

		if (!this._cooldowns.has(matchedCommands.name)) {
			this._cooldowns.set(matchedCommands.name, new Collection());
		}

		const now = Date.now();
		const timestamps = this._cooldowns.get(matchedCommands.name);
		const cooldownAmount = (matchedCommands.cooldown || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;

				if (message.channel.type === "DM") {
					await message.reply(`Tu dois attendre ${timeLeft.toFixed(1)} seconde(s) avant de pouvoir réutiliser la commande \`${matchedCommands.name}\``);
					return;
				}
				else {
					const response = await DiscordHelper.replyToMessageAuthor(message, `Tu dois attendre ${timeLeft.toFixed(1)} seconde(s) avant de pouvoir réutiliser la commande \`${matchedCommands.name}\``);
					return DiscordHelper.deleteMessage(response, 5000);
				}
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			await matchedCommands.run(commandContext);
		}
		catch (error) {
			this._logService.error(error);
			await DiscordHelper.replyToMessageAuthor(message, "une erreur s'est produite, veuillez contacter un administrateur");
		}
	}

	private isCommand(message: Message): boolean {
		return message.content.startsWith(this._prefix);
	}
}