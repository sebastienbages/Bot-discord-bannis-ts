import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { ServicesProvider } from "../../ServicesProvider";
import { CommandInteraction, GuildMember, PermissionResolvable } from "discord.js";
import { AdminService } from "../../Services/AdminService";
import { ApplicationCommandOptionType } from "discord-api-types/v9";
import { InteractionError } from "../../Error/InteractionError";
import { LogService } from "../../Services/LogService";

export class AdminCommand implements ISlashCommand {
	public readonly name: string = "admin";
	public readonly description: string = "Tu peux choisir qui recevra une copie de messages privés adressés au bot";
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";
	public readonly commandOptions: CommandOptions[] = [];
	public readonly subCommandsOptions: SubCommandOptions[] = [
		{
			name: "liste",
			description: "Tu veux connaître la liste des administrateurs ?",
		},
		{
			name: "ajouter",
			description: "Je peux enregistrer un utilisateur comme administrateur",
			option: {
				type: ApplicationCommandOptionType.User,
				name: "utilisateur",
				description: "Quel utilisateur ?",
				isRequired: true,
			},
		},
		{
			name: "supprimer",
			description: "Je peux supprimer un administrateur de la liste",
			option: {
				type: ApplicationCommandOptionType.User,
				name: "utilisateur",
				description: "Quel utilisateur ?",
				isRequired: true,
			},
		},
	];

	private adminService: AdminService;
	private logService: LogService;

	constructor() {
		this.adminService = ServicesProvider.getAdminService();
		this.logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const subCommandName = commandInteraction.options.getSubcommand();

		if (subCommandName === "liste") {
			return await this.adminService.sendAdminList(commandInteraction);
		}

		const targetMember = commandInteraction.options.getMember("utilisateur") as GuildMember;

		if (subCommandName === "ajouter") {
			if (this.adminService.adminIsExist(targetMember.id)) {
				throw new InteractionError(
					"Cet utilisateur est déjà enregistré",
					commandInteraction.commandName,
					`L'admin ${targetMember.displayName} est deja enregistre`
				);
			}

			await this.adminService.createAdmin(targetMember.id, targetMember.displayName);
			await commandInteraction.editReply({ content: "Enregistrement effectué avec succès" });
			return this.logService.info(`Nouvel administrateur cree : ${targetMember.displayName} (${targetMember.id})`);
		}

		if (subCommandName === "supprimer") {
			if (!this.adminService.adminIsExist(targetMember.id)) {
				throw new InteractionError(
					"Cet utilisateur n'est pas enregistré",
					commandInteraction.commandName,
					`L'admin ${targetMember.displayName} n'est pas enregistre`
				);
			}

			await this.adminService.removeAdmin(targetMember.id);
			await commandInteraction.editReply({ content: "Suppression effectuée avec succès" });
			return this.logService.info(`Administrateur supprime : ${targetMember.displayName} (${targetMember.id})`);
		}
	}
}
