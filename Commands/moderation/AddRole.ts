import { GuildMember, Message, MessageEmbed, PermissionResolvable, Role } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";
import { DiscordHelper } from "../../Helper/DiscordHelper";

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
		const user: GuildMember = await DiscordHelper.getUserByMention(message);

		if (!user) {
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ce membre n'existe pas");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		const roleAssign: string = args[1];
		const role: Role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleAssign.toLowerCase());

		if (!role) {
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ce rôle n'existe pas !");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		if (user.roles.cache.has(role.id)) {
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ce membre possède déjà ce role !");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		await user.roles.add(role.id);

		const dmMessageToUser = new MessageEmbed()
			.setColor(Config.color)
			.setDescription(`Bravo ! Tu as reçu le rôle de **${role.name}** !`);

		await user.send({ embeds: [ dmMessageToUser ] });
		const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Rôle attribué avec succès !");
		DiscordHelper.deleteMessage(response, 5000);
	}
}