import { Client, Collection, Message } from "discord.js";
import { ICommand } from "../Commands/ICommand";
import { CommandContext } from "../Commands/CommandContext";
import { Config } from "../Config/Config";
import { ServiceProvider } from "./ServiceProvider";
import { WebhookProvider } from "./WebhookProvider";

export class CommandHandler {
	private _commands: ICommand[];
	private readonly _prefix: string;
	private _cooldowns: Collection<string, Collection<string, number>>;

	constructor(prefix: string) {
		this._commands = Config.getCommandsInstances();
		this._prefix = prefix;
		this._cooldowns = new Collection();
	}

	async handleMessage(message: Message, client: Client): Promise<void> {
		const webHookVoteKeeper = WebhookProvider.getVoteKeeper();

		if (message.author.id === webHookVoteKeeper.id) {
			await ServiceProvider.getVoteService().saveMessage(message);
			return undefined;
		}

		if (message.author.bot) return undefined;

		if (message.channel.type === "dm" && !message.content.startsWith(this._prefix)) {
			const adminService = await ServiceProvider.getAdminService();
			await adminService.transfertPrivateMessage(message);
			return undefined;
		}

		if (!this.isCommand(message)) return undefined;

		if (message.channel.type != "dm") await message.delete();

		const commandContext = new CommandContext(message, this._prefix);
		const matchedCommands = this._commands.find(command => command.aliases.includes(commandContext.command) || command.name.includes(commandContext.command));

		if (!matchedCommands) {
			const response = await message.reply("je ne reconnais pas cette commande");
			await response.delete({ timeout: 5000 });
			return undefined;
		}

		const guild = client.guilds.cache.find(g => g.id === Config.guildId);
		const authorPerms = guild.members.cache.find(user => user.id === message.author.id);

		if (!authorPerms || !authorPerms.hasPermission(matchedCommands.permission)) {
			if (message.channel.type != "dm") {
				const response = await message.reply("Vous n'avez pas la permission d'utiliser cette commande");
				await response.delete({ timeout: 5000 });
				return undefined;
			}
			else {
				await message.reply("Vous n'avez pas la permission d'utiliser cette commande");
				return undefined;
			}
		}

		if (matchedCommands.guildOnly && message.channel.type === "dm") {
			await message.reply("Je ne peux pas éxécuter cette commande dans un salon privé");
			return undefined;
		}

		if (matchedCommands.argumentIsNecessary && !commandContext.args.length) {
			let reply = `Il vous manque l'argument, ${message.author} !`;

			if (matchedCommands.usage) {
				reply += `\nCette commande s'utilise comme ceci : \`${commandContext.commandPrefix}${matchedCommands.name} ${matchedCommands.usage}\``;
			}

			const response = await message.channel.send(reply);
			await response.delete({ timeout: 10000 });
			return undefined;
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

				if (message.channel.type === "dm") {
					await message.reply(`Tu dois attendre ${timeLeft.toFixed(1)} seconde(s) avant de pouvoir réutiliser la commande \`${matchedCommands.name}\``);
					return undefined;
				}
				else {
					const response = await message.reply(`Tu dois attendre ${timeLeft.toFixed(1)} seconde(s) avant de pouvoir réutiliser la commande \`${matchedCommands.name}\``);
					await response.delete({ timeout: 5000 });
					return undefined;
				}
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			await matchedCommands.run(commandContext);
		}
		catch (error) {
			await message.reply("une erreur s'est produite, veuillez contacter un administrateur");
			console.error(error);
		}
	}

	private isCommand(message: Message): boolean {
		return message.content.startsWith(this._prefix);
	}
}