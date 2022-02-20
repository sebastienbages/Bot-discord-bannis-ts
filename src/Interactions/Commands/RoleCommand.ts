import { CommandInteraction, GuildMember, MessageEmbed, PermissionResolvable, Role } from "discord.js";
import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { Config } from "../../Config/Config";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { InteractionError } from "../../Error/InteractionError";
import { LogService } from "../../Services/LogService";
import { ServicesProvider } from "../../ServicesProvider";

export class RoleCommand implements ISlashCommand {
	public readonly name: string = "role";
	public readonly description:string = "Je peux ajouter ou supprimer des rôles pour un utilisateur";
	public readonly permission: PermissionResolvable = "MANAGE_ROLES";
	public readonly commandOptions: CommandOptions[] = [
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
	public readonly subCommandsOptions: SubCommandOptions[] = [];

	private logService: LogService;

	public constructor() {
		this.logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const targetMember = commandInteraction.options.getMember("utilisateur") as GuildMember;
		const role = commandInteraction.options.getRole("role") as Role;
		const option = commandInteraction.options.getString("option") as string;

		if (option === "ajouter") {
			if (targetMember.roles.cache.has(role.id)) {
				throw new InteractionError(
					"Cet utilisateur a déjà ce rôle :unamused:",
					commandInteraction.commandName,
					`Le membre ${targetMember.displayName} possede deja le role ${role.name}`
				);
			}

			await targetMember.roles.add(role.id);

			const dmMessageToUser = new MessageEmbed()
				.setColor(Config.color)
				.setDescription(`:mailbox_with_mail: L'équipe des Bannis viens de t'attribuer le rôle de **\`\`${role.name}\`\`** :sunglasses:`);

			await targetMember.send({ embeds: [ dmMessageToUser ] });
			await commandInteraction.editReply({ content: "J'ai attribué le rôle et je l'ai prévenu par message privé :blush:" });
			return this.logService.info(`Role ${role.name} ajoute a ${targetMember.displayName}`);
		}

		if (option === "supprimer") {
			if (!targetMember.roles.cache.has(role.id)) {
				throw new InteractionError(
					"Cet utilisateur ne possède pas ce rôle :unamused:",
					commandInteraction.commandName,
					`Le membre ${targetMember.displayName} ne possede pas le role ${role.name}`
				);
			}

			await targetMember.roles.remove(role.id);
			await commandInteraction.editReply({ content: "J'ai bien supprimé le rôle :broom:" });
			return this.logService.info(`Role ${role.name} supprime a ${targetMember.displayName}`);
		}
	}
}
