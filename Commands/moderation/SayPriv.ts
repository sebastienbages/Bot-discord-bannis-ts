import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { GuildMember, Message, PermissionResolvable } from "discord.js";

export class SayPrivCommand implements ICommand {
	public readonly name: string = "saypriv";
	public readonly aliases: string[] = [ "prive", "chuchoter" ];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Envoi un message privé à l'utilisateur spécifié";
	public readonly usage: string = "<@membre> <message>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";

	async run(commandContext: CommandContext): Promise<void> {
		const message: Message = commandContext.message;
		const args: string[] = commandContext.args;

		try {
			const user: GuildMember = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);

			if (!user) {
				const response: Message = await message.reply("ce membre n'existe pas");
				response.delete({ timeout: 5000 });
				return undefined;
			}

			const privateMessage: string = args[1];

			if (!privateMessage || privateMessage.length < 1) {
				const response: Message = await message.reply("ton message est vide");
				response.delete({ timeout: 5000 });
				return undefined;
			}

			user.send(privateMessage);
		}
		catch (error) {
			message.reply("je n'arrive pas à lui envoyer un message privé !");
		}
	}
}