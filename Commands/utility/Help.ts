import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";
import { Message, PermissionResolvable, Permissions } from "discord.js";
import { DiscordHelper } from "../../Helper/DiscordHelper";

export class HelpCommand implements ICommand {
	public readonly name: string = "help";
	public readonly aliases: string[] = [ "commandes", "aide" ];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Liste de toutes les commandes ou détail d'une commande spécifique";
	public readonly usage: string = "<nom de la commande>";
	public readonly guildOnly: boolean = false;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = Permissions.FLAGS.MANAGE_MESSAGES;

	async run(commandContext: CommandContext): Promise<void> {
		const args: string[] = commandContext.args;
		const message: Message = commandContext.message;
		const commands: ICommand[] = Config.getCommandsInstances();
		const data: string[] = [];

		if (!args.length) {
			data.push("Liste des commandes :");
			data.push(commands.map(command => `\`${command.name}\``).join(", "));
			data.push(`\nTu peux m'envoyer en privé \`${commandContext.commandPrefix}help [nom de la commande]\` pour obtenir plus d'informations sur une commande :wink:`);

			await message.author.send({ content: data.join("\n") });

			if (message.channel.type != "DM") {
				const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Je t'ai envoyé la liste des commandes en message privé :wink:");
				DiscordHelper.deleteMessage(response, 5000);
			}

			return;
		}

		const name: string = args[0].toLowerCase();
		const command: ICommand = commands.find(c => c.aliases.includes(name) || c.name.includes(name));

		if (!command) {
			if (message.channel.type === "DM") {
				await DiscordHelper.replyToMessageAuthor(message, "Cette commande n'existe pas");
			}
			else {
				const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Cette commande n'existe pas");
				return DiscordHelper.deleteMessage(response, 5000);
			}
		}

		data.push(`**Nom:** \`${command.name}\``);

		if (command.aliases && command.aliases.length > 0) {
			data.push(`**Alias :** \`${command.aliases.join(", ")}\``);
		}
		else {
			data.push("**Alias :** `aucun`");
		}

		if (command.description) data.push(`**Description :** ${command.description}`);
		if (command.usage) data.push(`**Usage :** \`${commandContext.commandPrefix}${command.name} ${command.usage}\``);

		data.push(`**Cooldown :** ${command.cooldown} seconde(s)`);
		await message.author.send(data.join("\n"));
	}
}