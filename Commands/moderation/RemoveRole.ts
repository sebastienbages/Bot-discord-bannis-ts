import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { GuildMember, Message, PermissionResolvable, Role } from "discord.js";

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
		const user: GuildMember = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);

		if (!user) {
			const response: Message = await message.reply("le membre n'existe pas");
			await response.delete({ timeout: 5000 });
			return undefined;
		}

		const roleAssign: string = args[1];
		const role: Role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleAssign.toLowerCase());

		if (!role) {
			const response: Message = await message.reply("ce rôle n'existe pas !");
			await response.delete({ timeout: 5000 });
			return undefined;
		}

		if (user.roles.cache.has(role.id)) {
			await user.roles.remove(role.id);
			const response: Message = await message.reply("rôle supprimé avec succès !");
			await response.delete({ timeout: 5000 });
		}
		else {
			const response: Message = await message.reply("cet utilisateur ne possède pas ce rôle");
			await response.delete({ timeout: 5000 });
		}
	}
}