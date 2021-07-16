import { GuildMember, Message, MessageEmbed, PermissionResolvable, Role } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class AddRoleCommand implements ICommand {
	public readonly name: string = "addrole";
	public readonly aliases: string[] = [ "ajouter_role" ];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description:string = "Ajoute un rôle pour un membre";
	public readonly usage:string = "<@membre> <role>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "MANAGE_ROLES";

	async run(commandContext: CommandContext): Promise<void> {
		const message: Message = commandContext.message;
		const args: string[] = commandContext.args;
		const user: GuildMember = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);

		if (!user) {
			const response: Message = await message.reply("ce membre n'existe pas");
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
			const response: Message = await message.reply("ce membre possède déjà ce role !");
			await response.delete({ timeout: 5000 });
			return undefined;
		}

		await user.roles.add(role.id);

		const dmMessageToUser = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Bravo ! Tu as reçu le rôle de **${role.name}** !`);

		await user.send(dmMessageToUser);
		const response: Message = await message.reply("rôle attribué avec succès !");
		await response.delete({ timeout: 5000 });
	}
}