import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { GuildMember, Message, PermissionResolvable } from "discord.js";
import { DiscordHelper } from "../../Helper/DiscordHelper";

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
			const user: GuildMember = await DiscordHelper.getUserByMention(message);

			if (!user) {
				const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ce membre n'existe pas");
				return DiscordHelper.deleteMessage(response, 5000);
			}

			const privateMessage: string = args[1];

			if (!privateMessage || privateMessage.length < 1) {
				const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ton message est vide");
				return DiscordHelper.deleteMessage(response, 5000);
			}

			await user.send(privateMessage);
		}
		catch (error) {
			await DiscordHelper.replyToMessageAuthor(message, "Je n'arrive pas à lui envoyer un message privé !");
		}
	}
}