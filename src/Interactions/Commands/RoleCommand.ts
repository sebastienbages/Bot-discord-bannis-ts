import { CommandInteraction, GuildMember, MessageEmbed, PermissionResolvable, Role } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { Config } from "../../Config/Config";
import { ApplicationCommandOptionType } from "discord-api-types";

export class RoleCommand implements ISlashCommand {
	public readonly name: string = "role";
	public readonly description:string = "Je peux ajouter ou supprimer des rôles pour un utilisateur";
	public readonly permission: PermissionResolvable = "MANAGE_ROLES";
	readonly commandOptions: CommandOptions[] = [
		{
			type: ApplicationCommandOptionType.String,
			name: "option",
			description: "Que veux-tu faire ?",
			isRequired: true,
			choices: [
				[
					"Ajouter",
					"ajouter",
				],
				[
					"Supprimer",
					"supprimer",
				],
			],
		},
		{
			type: ApplicationCommandOptionType.User,
			name: "utilisateur",
			description: "Quel utilisateur ?",
			isRequired: true,
		},
		{
			type: ApplicationCommandOptionType.Role,
			name: "role",
			description: "Quel rôle ?",
			isRequired: true,
		},
	];
	readonly subCommandsOptions: SubCommandOptions[] = [];

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const guildMember = commandInteraction.options.getMember("utilisateur") as GuildMember;
		const role = commandInteraction.options.getRole("role") as Role;
		const option = commandInteraction.options.getString("option") as string;

		if (option === "ajouter") {
			if (guildMember.roles.cache.has(role.id)) {
				return await commandInteraction.reply({ content: "Cet utilisateur a déjà ce rôle :unamused:", ephemeral: true, fetchReply: false });
			}

			await guildMember.roles.add(role.id);

			const dmMessageToUser = new MessageEmbed()
				.setColor(Config.color)
				.setDescription(`:mailbox_with_mail: L'équipe des Bannis viens de t'attribuer le rôle de **\`\`${role.name}\`\`** :sunglasses:`);

			await guildMember.send({ embeds: [ dmMessageToUser ] });
			return await commandInteraction.reply({ content: "J'ai attribué le rôle et je l'ai prévenu par message privé :blush:", ephemeral: true, fetchReply: false });
		}

		if (option === "supprimer") {
			if (guildMember.roles.cache.has(role.id)) {
				await guildMember.roles.remove(role.id);
				return await commandInteraction.reply({ content: "J'ai bien supprimé le rôle :broom:", ephemeral: true, fetchReply: false });
			}
			else {
				return await commandInteraction.reply({ content: "Cet utilisateur ne possède pas ce rôle :unamused:", ephemeral: true, fetchReply: false });
			}
		}
	}
}