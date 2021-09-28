import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { GuildMember, Message, PermissionResolvable, Role } from "discord.js";
import { DiscordHelper } from "../../Helper/DiscordHelper";

export class RemoveRoleCommand implements ICommand {
	public readonly name: string = "removerole";
	public readonly aliases: string[] = [ "supprimer_role" ];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Supprime un rôle pour un membre";
	public readonly usage: string = "<@membre> <role>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "MANAGE_ROLES";

	async run(commandContext: CommandContext): Promise<void> {
		const message: Message = commandContext.message;
		const args: string[] = commandContext.args;
		const user: GuildMember = await DiscordHelper.getUserByMention(message);

		if (!user) {
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Le membre n'existe pas");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		const roleAssign: string = args[1];
		const role: Role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleAssign.toLowerCase());

		if (!role) {
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ce rôle n'existe pas !");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		if (user.roles.cache.has(role.id)) {
			await user.roles.remove(role.id);
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Rôle supprimé avec succès !");
			return DiscordHelper.deleteMessage(response, 5000);
		}
		else {
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "cet utilisateur ne possède pas ce rôle");
			return DiscordHelper.deleteMessage(response, 5000);
		}
	}
}