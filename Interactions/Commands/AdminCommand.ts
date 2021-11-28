import { CommandOptions, ISlashCommand, SubCommandOptions } from "../../Interfaces/ISlashCommand";
import { ServicesProvider } from "../../src/ServicesProvider";
import { CommandInteraction, GuildMember, PermissionResolvable } from "discord.js";
import { AdminService } from "../../Services/AdminService";
import { ApplicationCommandOptionType } from "discord-api-types";

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
	private _adminService: AdminService;

	constructor() {
		this._adminService = ServicesProvider.getAdminService();
	}

	public async executeInteraction(commandInteraction: CommandInteraction): Promise<void> {
		const subCommandName = commandInteraction.options.getSubcommand();

		if (subCommandName === "liste") {
			await this._adminService.sendAdminList(commandInteraction);
		}

		if (subCommandName === "ajouter") {
			const guildMember = commandInteraction.options.getMember("utilisateur") as GuildMember;
			if (!this._adminService.adminIsExist(guildMember.id)) {
				await this._adminService.createAdmin(guildMember.id, guildMember.displayName);
				return await commandInteraction.reply({ content: "Enregistrement effectué avec succès", ephemeral: true, fetchReply: false });
			}
			else {
				return await commandInteraction.reply({ content: "Cet utilisateur est déjà enregistré", ephemeral: true, fetchReply: false });
			}
		}

		if (subCommandName === "supprimer") {
			const guildMember = commandInteraction.options.getMember("utilisateur") as GuildMember;
			if (this._adminService.adminIsExist(guildMember.id)) {
				await this._adminService.removeAdmin(guildMember.id);
				return await commandInteraction.reply({ content: "Suppression effectuée avec succès", ephemeral: true, fetchReply: false });
			}
			else {
				return await commandInteraction.reply({ content: "Cet utilisateur n'est pas enregistré", ephemeral: true, fetchReply: false });
			}
		}
	}
}